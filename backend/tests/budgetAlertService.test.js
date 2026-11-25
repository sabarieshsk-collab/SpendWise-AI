import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {
  evaluateBudgetUtilization,
  dispatchAlertWebhook,
  processFinanceAlertsAsync,
  generateAlertKey,
  validateEmail
} from '../src/services/budgetAlertService.js';

test('Budget Alert Automation Service Comprehensive Test Suite', async (t) => {
  const targetMonth = '2026-11';
  const testUser = {
    id: 'usr_abc123',
    fullName: 'Jordan Miller',
    email: 'jordan.miller@spendwise.ai'
  };

  // 1. Spending below 50%
  await t.test('1. Spending below 50% does not trigger an alert', () => {
    const transactions = [
      { id: 'tx-1', category: 'Food', type: 'expense', amount: 4500, date: '2026-11-05' }
    ];
    const budgets = { Food: { limit: 10000 } }; // 45% utilization

    const results = evaluateBudgetUtilization(transactions, budgets, targetMonth);
    assert.equal(results.length, 1);
    assert.equal(results[0].category, 'Food');
    assert.equal(results[0].spentAmount, 4500);
    assert.equal(results[0].utilizationPercentage, 45);
    assert.equal(results[0].threshold, null);
    assert.equal(results[0].isAlertEligible, false);
  });

  // 2. Crossing 50%
  await t.test('2. Crossing 50% generates a 50% alert tier', () => {
    const transactions = [
      { id: 'tx-1', category: 'Food', type: 'expense', amount: 5500, date: '2026-11-05' }
    ];
    const budgets = { Food: { limit: 10000 } }; // 55%

    const results = evaluateBudgetUtilization(transactions, budgets, targetMonth);
    assert.equal(results.length, 1);
    assert.equal(results[0].utilizationPercentage, 55);
    assert.equal(results[0].threshold, '50');
    assert.equal(results[0].alertLevel, 'NOTICE');
    assert.equal(results[0].isAlertEligible, true);

    const key = generateAlertKey(testUser.id, results[0].category, results[0].month, results[0].threshold);
    assert.equal(key, 'usr_abc123_Food_2026-11_50');
  });

  // 3. Crossing 80%
  await t.test('3. Crossing 80% generates an 80% alert tier', () => {
    const transactions = [
      { id: 'tx-1', category: 'Food', type: 'expense', amount: 8200, date: '2026-11-12' }
    ];
    const budgets = { Food: { limit: 10000 } }; // 82%

    const results = evaluateBudgetUtilization(transactions, budgets, targetMonth);
    assert.equal(results.length, 1);
    assert.equal(results[0].utilizationPercentage, 82);
    assert.equal(results[0].threshold, '80');
    assert.equal(results[0].alertLevel, 'WARNING');
    assert.equal(results[0].isAlertEligible, true);

    const key = generateAlertKey(testUser.id, results[0].category, results[0].month, results[0].threshold);
    assert.equal(key, 'usr_abc123_Food_2026-11_80');
  });

  // 4. Crossing 100%
  await t.test('4. Crossing 100% generates a 100% alert tier', () => {
    const transactions = [
      { id: 'tx-1', category: 'Food', type: 'expense', amount: 10500, date: '2026-11-20' }
    ];
    const budgets = { Food: { limit: 10000 } }; // 105%

    const results = evaluateBudgetUtilization(transactions, budgets, targetMonth);
    assert.equal(results.length, 1);
    assert.equal(results[0].utilizationPercentage, 105);
    assert.equal(results[0].threshold, '100');
    assert.equal(results[0].alertLevel, 'CRITICAL');
    assert.equal(results[0].isAlertEligible, true);

    const key = generateAlertKey(testUser.id, results[0].category, results[0].month, results[0].threshold);
    assert.equal(key, 'usr_abc123_Food_2026-11_100');
  });

  // 5. Repeated finance updates (idempotency simulation)
  await t.test('5. Repeated finance updates produce matching alertKey and handle downstream duplicate_skipped response', async () => {
    // Start mock n8n server simulating PostgreSQL deduplication
    let hitCount = 0;
    const mockServer = http.createServer((req, res) => {
      hitCount++;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      // First hit simulates new alert; second simulates duplicate skipped by PostgreSQL
      if (hitCount === 1) {
        res.end(JSON.stringify({ status: 'notification_sent', stateRecorded: true }));
      } else {
        res.end(JSON.stringify({ status: 'duplicate_skipped', reason: 'alert already sent' }));
      }
    });

    await new Promise((resolve) => mockServer.listen(0, resolve));
    const mockPort = mockServer.address().port;

    const originalUrl = process.env.SPENDWISE_N8N_WEBHOOK_URL;
    const originalSecret = process.env.SPENDWISE_WEBHOOK_SECRET;
    process.env.SPENDWISE_N8N_WEBHOOK_URL = `http://127.0.0.1:${mockPort}/webhook`;
    process.env.SPENDWISE_WEBHOOK_SECRET = 'mock_secret_token_123';

    try {
      const candidate = {
        category: 'Food',
        month: '2026-11',
        budgetAmount: 10000,
        spentAmount: 8500,
        utilizationPercentage: 85,
        threshold: '80',
        alertLevel: 'WARNING',
        isAlertEligible: true
      };

      // First dispatch
      const res1 = await dispatchAlertWebhook(candidate, testUser);
      assert.equal(res1.success, true);
      assert.equal(res1.isDuplicate, false);
      assert.equal(res1.alertKey, 'usr_abc123_Food_2026-11_80');

      // Second dispatch (repeated save without changing threshold)
      const res2 = await dispatchAlertWebhook(candidate, testUser);
      assert.equal(res2.success, true);
      assert.equal(res2.isDuplicate, true);
      assert.equal(res2.alertKey, 'usr_abc123_Food_2026-11_80');
    } finally {
      process.env.SPENDWISE_N8N_WEBHOOK_URL = originalUrl;
      process.env.SPENDWISE_WEBHOOK_SECRET = originalSecret;
      mockServer.close();
    }
  });

  // 6. Editing or deleting transactions
  await t.test('6. Editing or deleting transactions recalculates utilization using only saved transactions', () => {
    let transactions = [
      { id: 'tx-1', category: 'Entertainment', type: 'expense', amount: 5000, date: '2026-11-02' },
      { id: 'tx-2', category: 'Entertainment', type: 'expense', amount: 4000, date: '2026-11-10' }
    ];
    const budgets = { Entertainment: { limit: 10000 } };

    // Initially 9,000 / 10,000 = 90% (threshold 80)
    let res = evaluateBudgetUtilization(transactions, budgets, targetMonth);
    assert.equal(res[0].spentAmount, 9000);
    assert.equal(res[0].threshold, '80');

    // Simulate editing tx-2 from 4000 to 1000
    transactions = [
      { id: 'tx-1', category: 'Entertainment', type: 'expense', amount: 5000, date: '2026-11-02' },
      { id: 'tx-2', category: 'Entertainment', type: 'expense', amount: 1000, date: '2026-11-10' }
    ];
    res = evaluateBudgetUtilization(transactions, budgets, targetMonth);
    assert.equal(res[0].spentAmount, 6000); // 60% -> threshold 50
    assert.equal(res[0].threshold, '50');

    // Simulate deleting tx-2 completely
    transactions = [
      { id: 'tx-1', category: 'Entertainment', type: 'expense', amount: 4000, date: '2026-11-02' }
    ];
    res = evaluateBudgetUtilization(transactions, budgets, targetMonth);
    assert.equal(res[0].spentAmount, 4000); // 40% -> below 50%
    assert.equal(res[0].threshold, null);
    assert.equal(res[0].isAlertEligible, false);
  });

  // 7. Updating budget amounts
  await t.test('7. Updating budget amounts recalculates utilization against the new limit', () => {
    const transactions = [
      { id: 'tx-1', category: 'Shopping', type: 'expense', amount: 7500, date: '2026-11-04' }
    ];

    // Budget limit = 8000 -> 7500 / 8000 = 93.75% -> threshold 80
    let res = evaluateBudgetUtilization(transactions, { Shopping: { limit: 8000 } }, targetMonth);
    assert.equal(res[0].threshold, '80');

    // User raises budget to 16000 -> 7500 / 16000 = 46.88% -> below 50%
    res = evaluateBudgetUtilization(transactions, { Shopping: { limit: 16000 } }, targetMonth);
    assert.equal(res[0].threshold, null);
    assert.equal(res[0].isAlertEligible, false);

    // User lowers budget to 7000 -> 7500 / 7000 = 107.1% -> threshold 100
    res = evaluateBudgetUtilization(transactions, { Shopping: { limit: 7000 } }, targetMonth);
    assert.equal(res[0].threshold, '100');
    assert.equal(res[0].alertLevel, 'CRITICAL');
  });

  // 8. Different users and categories
  await t.test('8. Different users and categories generate distinct alert keys and isolations', () => {
    const transactions = [
      { id: 'tx-1', category: 'Food', type: 'expense', amount: 8000, date: '2026-11-01' },
      { id: 'tx-2', category: 'Travel', type: 'expense', amount: 15000, date: '2026-11-02' }
    ];
    const budgets = {
      Food: { limit: 10000 },   // 80% -> 80
      Travel: { limit: 12000 }  // 125% -> 100
    };

    const results = evaluateBudgetUtilization(transactions, budgets, targetMonth);
    assert.equal(results.length, 2);

    const foodResult = results.find((r) => r.category === 'Food');
    const travelResult = results.find((r) => r.category === 'Travel');

    assert.equal(foodResult.threshold, '80');
    assert.equal(travelResult.threshold, '100');

    // Distinct keys for user A
    const keyUserA_Food = generateAlertKey('user_A', foodResult.category, targetMonth, foodResult.threshold);
    const keyUserA_Travel = generateAlertKey('user_A', travelResult.category, targetMonth, travelResult.threshold);
    assert.equal(keyUserA_Food, 'user_A_Food_2026-11_80');
    assert.equal(keyUserA_Travel, 'user_A_Travel_2026-11_100');

    // Distinct keys for user B
    const keyUserB_Food = generateAlertKey('user_B', foodResult.category, targetMonth, foodResult.threshold);
    assert.equal(keyUserB_Food, 'user_B_Food_2026-11_80');
    assert.notEqual(keyUserA_Food, keyUserB_Food);
  });

  // 9. Missing or invalid user email
  await t.test('9. Missing or invalid user email is caught gracefully without dispatching', async () => {
    const candidate = {
      category: 'Food',
      month: '2026-11',
      budgetAmount: 10000,
      spentAmount: 8500,
      utilizationPercentage: 85,
      threshold: '80',
      alertLevel: 'WARNING',
      isAlertEligible: true
    };

    // User with no email
    const resNoEmail = await dispatchAlertWebhook(candidate, { id: 'usr_no_email', fullName: 'No Email' });
    assert.equal(resNoEmail.success, false);
    assert.ok(resNoEmail.error.includes('Valid user ID and email'));

    // User with invalid email format
    const resBadEmail = await dispatchAlertWebhook(candidate, { id: 'usr_bad_email', email: 'not-an-email' });
    assert.equal(resBadEmail.success, false);
    assert.ok(resBadEmail.error.includes('Valid user ID and email'));

    // processFinanceAlertsAsync with missing email returns empty results without throwing
    const resAsync = await processFinanceAlertsAsync(
      { transactions: [{ category: 'Food', type: 'expense', amount: 8500, date: '2026-11-01' }], budgets: { Food: { limit: 10000 } } },
      { id: 'usr_test_no_email', email: null },
      targetMonth
    );
    assert.deepEqual(resAsync, []);
  });

  // 10. n8n webhook failure without breaking finance persistence
  await t.test('10. n8n webhook failure (500/timeout) is handled gracefully and does not throw', async () => {
    // Mock server returning HTTP 500 error
    const mockErrorServer = http.createServer((req, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal automation failure' }));
    });

    await new Promise((resolve) => mockErrorServer.listen(0, resolve));
    const mockPort = mockErrorServer.address().port;

    const originalUrl = process.env.SPENDWISE_N8N_WEBHOOK_URL;
    const originalSecret = process.env.SPENDWISE_WEBHOOK_SECRET;
    process.env.SPENDWISE_N8N_WEBHOOK_URL = `http://127.0.0.1:${mockPort}/webhook`;
    process.env.SPENDWISE_WEBHOOK_SECRET = 'mock_secret_token_123';

    try {
      const financeDoc = {
        transactions: [
          { id: 'tx-1', category: 'Food', type: 'expense', amount: 9000, date: '2026-11-01' }
        ],
        budgets: { Food: { limit: 10000 } }
      };

      // Dispatches without throwing an uncaught exception
      const results = await processFinanceAlertsAsync(financeDoc, testUser, targetMonth);
      assert.equal(results.length, 1);
      assert.equal(results[0].success, false);
      assert.equal(results[0].status, 500);
      assert.ok(results[0].error.includes('status 500'));
    } finally {
      process.env.SPENDWISE_N8N_WEBHOOK_URL = originalUrl;
      process.env.SPENDWISE_WEBHOOK_SECRET = originalSecret;
      mockErrorServer.close();
    }
  });

  // Extra verification: Income transactions are strictly excluded
  await t.test('11. Income transactions are strictly excluded from monthly expenses', () => {
    const transactions = [
      { id: 'tx-1', category: 'Salary', type: 'income', amount: 150000, date: '2026-11-01' },
      { id: 'tx-2', category: 'Food', type: 'income', amount: 5000, date: '2026-11-02' }, // e.g. refund categorized as food
      { id: 'tx-3', category: 'Food', type: 'expense', amount: 3000, date: '2026-11-03' }
    ];
    const budgets = { Food: { limit: 10000 } };

    const results = evaluateBudgetUtilization(transactions, budgets, targetMonth);
    assert.equal(results[0].spentAmount, 3000); // Only the 3,000 expense is counted
    assert.equal(results[0].utilizationPercentage, 30);
    assert.equal(results[0].isAlertEligible, false);
  });
});
