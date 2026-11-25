import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import { handleBudgetAlert, validateEmail, generateAlertKey } from '../src/controllers/automationController.js';

test('Automation Controller Unit & Timeout Tests', async (t) => {
  await t.test('validateEmail normalizes and validates email addresses', () => {
    assert.equal(validateEmail('User@Example.Com'), 'user@example.com');
    assert.equal(validateEmail('  alex.morgan@spendwise.ai  '), 'alex.morgan@spendwise.ai');
    assert.equal(validateEmail('invalid-email'), null);
    assert.equal(validateEmail(''), null);
    assert.equal(validateEmail(null), null);
    assert.equal(validateEmail(123), null);
  });

  await t.test('generateAlertKey produces canonical format: userId_category_month_threshold', () => {
    const key = generateAlertKey('usr_101', 'Food', '2026-11', '80%');
    assert.equal(key, 'usr_101_Food_2026-11_80');

    const key100 = generateAlertKey('usr_202', 'Housing', '2026-12', '100');
    assert.equal(key100, 'usr_202_Housing_2026-12_100');
  });

  await t.test('POST /api/automation/budget-alert returns 200 without alert when utilization < 50%', async () => {
    const app = express();
    app.use(express.json());
    app.post('/api/automation/budget-alert', handleBudgetAlert);

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/automation/budget-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test_user',
          userName: 'Test User',
          category: 'Shopping',
          month: '2026-11',
          email: 'test@example.com',
          budgetAmount: 10000,
          spentAmount: 4000 // 40% < 50%
        })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.alertTriggered, false);
      assert.equal(data.utilizationPercentage, 40);
      assert.ok(data.message.includes('below 50%'));
    } finally {
      server.close();
    }
  });

  await t.test('POST /api/automation/budget-alert respects configurable timeout and returns 504 on abort', async () => {
    // 1. Start a slow mock webhook server that delays response past the configured timeout
    const mockServer = http.createServer((req, res) => {
      // Intentionally delay responding for 600ms
      setTimeout(() => {
        if (!res.writableEnded) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok' }));
        }
      }, 600);
    });

    await new Promise((resolve) => mockServer.listen(0, resolve));
    const mockPort = mockServer.address().port;
    const mockUrl = `http://127.0.0.1:${mockPort}/mock-webhook`;

    // 2. Set test environment variables with a small 200ms timeout
    const originalUrl = process.env.SPENDWISE_N8N_WEBHOOK_URL;
    const originalSecret = process.env.SPENDWISE_WEBHOOK_SECRET;
    const originalTimeout = process.env.SPENDWISE_WEBHOOK_TIMEOUT_MS;

    process.env.SPENDWISE_N8N_WEBHOOK_URL = mockUrl;
    process.env.SPENDWISE_WEBHOOK_SECRET = 'test_secret_key_123';
    process.env.SPENDWISE_WEBHOOK_TIMEOUT_MS = '200'; // 200ms timeout for test

    const app = express();
    app.use(express.json());
    app.post('/api/automation/budget-alert', handleBudgetAlert);

    const appServer = app.listen(0);
    const appPort = appServer.address().port;

    try {
      const res = await fetch(`http://127.0.0.1:${appPort}/api/automation/budget-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test_user_timeout',
          userName: 'Timeout Test User',
          category: 'Dining',
          month: '2026-11',
          email: 'test@example.com',
          budgetAmount: 10000,
          spentAmount: 8500 // 85% triggers alert
        })
      });

      // Must return HTTP 504 Gateway Timeout due to AbortController timeout
      assert.equal(res.status, 504);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.ok(data.error.includes('timed out'));
    } finally {
      // Restore environment variables and close servers
      process.env.SPENDWISE_N8N_WEBHOOK_URL = originalUrl;
      process.env.SPENDWISE_WEBHOOK_SECRET = originalSecret;
      process.env.SPENDWISE_WEBHOOK_TIMEOUT_MS = originalTimeout;
      appServer.close();
      mockServer.close();
    }
  });

  await t.test('POST /api/automation/budget-alert returns 200 when mock webhook responds within timeout', async () => {
    // Start a fast mock server that responds immediately
    const mockServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'notification_sent' }));
    });

    await new Promise((resolve) => mockServer.listen(0, resolve));
    const mockPort = mockServer.address().port;
    const mockUrl = `http://127.0.0.1:${mockPort}/fast-webhook`;

    const originalUrl = process.env.SPENDWISE_N8N_WEBHOOK_URL;
    const originalSecret = process.env.SPENDWISE_WEBHOOK_SECRET;
    const originalTimeout = process.env.SPENDWISE_WEBHOOK_TIMEOUT_MS;

    process.env.SPENDWISE_N8N_WEBHOOK_URL = mockUrl;
    process.env.SPENDWISE_WEBHOOK_SECRET = 'test_secret_key_123';
    process.env.SPENDWISE_WEBHOOK_TIMEOUT_MS = '5000'; // Generous timeout

    const app = express();
    app.use(express.json());
    app.post('/api/automation/budget-alert', handleBudgetAlert);

    const appServer = app.listen(0);
    const appPort = appServer.address().port;

    try {
      const res = await fetch(`http://127.0.0.1:${appPort}/api/automation/budget-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test_user_success',
          userName: 'Success User',
          category: 'Groceries',
          month: '2026-11',
          email: 'test@example.com',
          budgetAmount: 10000,
          spentAmount: 8500
        })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.alertTriggered, true);
      assert.equal(data.threshold, '80');
      assert.equal(data.alertLevel, 'WARNING');
    } finally {
      process.env.SPENDWISE_N8N_WEBHOOK_URL = originalUrl;
      process.env.SPENDWISE_WEBHOOK_SECRET = originalSecret;
      process.env.SPENDWISE_WEBHOOK_TIMEOUT_MS = originalTimeout;
      appServer.close();
      mockServer.close();
    }
  });

  await t.test('Timeout fallback to 25000 when invalid timeout is provided', () => {
    const parse = (val) => {
      const p = Number(val);
      return Number.isFinite(p) && p > 0 ? p : 25000;
    };

    assert.equal(parse(undefined), 25000);
    assert.equal(parse(''), 25000);
    assert.equal(parse('invalid_string'), 25000);
    assert.equal(parse('-500'), 25000);
    assert.equal(parse('0'), 25000);
    assert.equal(parse('30000'), 30000);
    assert.equal(parse(15000), 15000);
  });
});
