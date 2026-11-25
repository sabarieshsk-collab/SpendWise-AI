import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import aiRoutes from '../src/routes/aiRoutes.js';
import errorHandler from '../src/middleware/errorHandler.js';

test('AI Spending Analyzer API Test Suite', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/ai', aiRoutes);
  app.use(errorHandler);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/ai/analyze-spending`;

  t.after(() => {
    server.close();
  });

  await t.test('POST /api/ai/analyze-spending returns 400 when spendingSummary is missing or invalid', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spendingSummary: null })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.error.includes('Payload "spendingSummary" is required'));
  });

  await t.test('POST /api/ai/analyze-spending returns 400 for negative totalSpending', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spendingSummary: {
          totalSpending: -500
        }
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.error.includes('totalSpending'));
  });

  await t.test('POST /api/ai/analyze-spending accepts payload unwrapped or wrapped in spendingSummary', async () => {
    const testPayload = {
      period: 'November 2026',
      totalSpending: 25000,
      averageDailySpending: 1250,
      categories: [{ name: 'Food', total: 5000, percentage: 20 }]
    };

    const resWrapped = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spendingSummary: testPayload })
    });

    assert.notEqual(resWrapped.status, 400, 'Wrapped payload must pass validation');

    const resUnwrapped = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    assert.notEqual(resUnwrapped.status, 400, 'Unwrapped payload must pass validation');
  });
});
