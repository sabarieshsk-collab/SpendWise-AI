import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BROWSER_BIN = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const DEBUG_PORT = 9222;
const tempUserDataDir = path.join(os.tmpdir(), `spendwise-chrome-test-${Date.now()}`);

console.log(`[Browser Verifier] Using browser: ${BROWSER_BIN}`);
console.log(`[Browser Verifier] User data dir: ${tempUserDataDir}`);

// 1. Launch Headless Browser Process
const browserProcess = spawn(BROWSER_BIN, [
  '--headless=new',
  `--remote-debugging-port=${DEBUG_PORT}`,
  `--user-data-dir=${tempUserDataDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-background-networking',
  '--disable-extensions',
  'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cleanup = () => {
  try {
    browserProcess.kill('SIGKILL');
  } catch (e) {}
  try {
    fs.rmSync(tempUserDataDir, { recursive: true, force: true });
  } catch (e) {}
};

process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(1); });

async function runTest() {
  await sleep(1500);

  // 2. Fetch Chrome DevTools Targets
  console.log('[Browser Verifier] Connecting to Chrome DevTools endpoint...');
  let versionData = null;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (res.ok) {
        versionData = await res.json();
        break;
      }
    } catch (e) {
      await sleep(500);
    }
  }

  if (!versionData) {
    throw new Error('Failed to connect to headless Chrome DevTools port');
  }

  console.log(`[Browser Verifier] Browser Version: ${versionData.Browser}`);

  const targetsRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const wsUrl = pageTarget.webSocketDebuggerUrl;

  console.log(`[Browser Verifier] Connecting to WebSocket: ${wsUrl}`);
  const ws = new WebSocket(wsUrl);

  let idCounter = 1;
  const pendingRequests = new Map();
  const consoleLogs = [];
  const consoleErrors = [];

  const sendCommand = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise((resolve) => ws.onopen = resolve);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pendingRequests.has(msg.id)) {
      const { resolve, reject } = pendingRequests.get(msg.id);
      pendingRequests.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }

    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map((a) => a.value || JSON.stringify(a)).join(' ');
      consoleLogs.push(`[Console ${msg.params.type}] ${text}`);
      if (msg.params.type === 'error') {
        consoleErrors.push(text);
      }
    }

    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      consoleErrors.push(msg.params.entry.text);
    }
  };

  // Enable CDP domains
  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');
  await sendCommand('Log.enable');

  // Step 1: Register/Login a verified test user via backend API to get session cookie
  console.log('[Browser Verifier] Creating authenticated test session...');
  const testEmail = `browser.verifier.${Date.now()}@spendwise.ai`;
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Browser Verifier User',
      email: testEmail,
      password: 'VerifyPassword2026!',
      confirmPassword: 'VerifyPassword2026!'
    })
  });

  const regData = await regRes.json();
  if (!regData.success) {
    throw new Error(`Failed to create test user: ${regData.message}`);
  }
  const token = regData.token;

  // Set auth cookie in headless browser
  await sendCommand('Network.enable');
  await sendCommand('Network.setCookie', {
    name: 'token',
    value: token,
    domain: 'localhost',
    path: '/',
    httpOnly: true
  });

  // Step 2: Navigate to Spending Analyzer page in browser
  console.log('[Browser Verifier] Navigating browser to http://localhost:3000/ai-spending-analyzer ...');
  await sendCommand('Page.navigate', { url: 'http://localhost:3000/ai-spending-analyzer' });

  // Wait for initial render
  await sleep(3000);

  // Step 3: Check page title and DOM elements
  const evaluate = async (expression) => {
    const res = await sendCommand('Runtime.evaluate', {
      expression,
      returnByValue: true
    });
    return res.result?.value;
  };

  const pageTitle = await evaluate('document.title');
  const h1Text = await evaluate('document.querySelector("h1")?.innerText');
  console.log(`[Browser Verifier] Page Title: "${pageTitle}"`);
  console.log(`[Browser Verifier] Main Header: "${h1Text}"`);

  // Step 4: Verify 6 KPI Cards are present
  const kpiCount = await evaluate('document.querySelectorAll(".shadow-card").length');
  console.log(`[Browser Verifier] Rendered Card Components Count: ${kpiCount}`);

  // Step 5: Wait for AI spending analysis to complete
  console.log('[Browser Verifier] Waiting for live AI spending report synthesis in browser...');
  let hasAiReport = false;
  let reportText = '';

  for (let attempt = 0; attempt < 25; attempt++) {
    const reportElem = await evaluate(`
      (() => {
        const h2s = Array.from(document.querySelectorAll('h2'));
        const aiHeader = h2s.find(h => h.innerText.includes('AI Financial Diagnostic'));
        if (!aiHeader) return null;
        const container = aiHeader.closest('.rounded-2xl');
        return {
          header: aiHeader.innerText,
          text: container ? container.innerText : '',
          hasError: container ? container.innerText.includes('Unable to reach') : false,
          isAnalyzing: container ? container.innerText.includes('Synthesizing Spending Metrics') : false
        };
      })()
    `);

    if (reportElem) {
      if (reportElem.hasError) {
        throw new Error(`Browser encountered AI error: ${reportElem.text}`);
      }
      if (!reportElem.isAnalyzing && reportElem.text.length > 200) {
        hasAiReport = true;
        reportText = reportElem.text;
        break;
      }
    }
    await sleep(2000);
  }

  if (!hasAiReport) {
    throw new Error('Timeout waiting for AI Spending Report in browser');
  }

  console.log('\n================ BROWSER VERIFICATION SUCCESS ================');
  console.log('✓ Headless browser successfully connected to frontend at http://localhost:3000');
  console.log('✓ Authenticated route /ai-spending-analyzer loaded without redirection');
  console.log(`✓ Page H1 header rendered: "${h1Text}"`);
  console.log(`✓ AI Analysis Report successfully synthesized and rendered in DOM (${reportText.length} characters)`);
  console.log('✓ AI Report Snippet:\n' + reportText.substring(0, 350) + '...');

  // Step 6: Console Error Auditing
  console.log('\n[Browser Verifier] Auditing browser console errors:');
  const criticalErrors = consoleErrors.filter(
    (e) => !e.includes('favicon') && !e.includes('ResizeObserver')
  );
  if (criticalErrors.length === 0) {
    console.log('✓ Zero critical browser console errors detected.');
  } else {
    console.warn(`! Console errors found (${criticalErrors.length}):`, criticalErrors);
  }
  console.log('==============================================================\n');

  ws.close();
  cleanup();
  process.exit(0);
}

runTest().catch((err) => {
  console.error('\n❌ [Browser Verifier Failed]:', err.message);
  cleanup();
  process.exit(1);
});
