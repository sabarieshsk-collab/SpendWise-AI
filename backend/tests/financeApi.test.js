import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB, { isDBConnected } from '../src/config/db.js';
import User from '../src/models/User.js';
import Finance from '../src/models/Finance.js';
import financeRoutes from '../src/routes/financeRoutes.js';
import { generateToken } from '../src/utils/token.js';

dotenv.config();

test('Finance API Security & Functionality Test Suite', async (t) => {
  // 1. Establish database connection for live testing
  const dbConnected = await connectDB();
  assert.equal(dbConnected, true, 'Live MongoDB connection must be established');

  // Set up Express test app
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/finance', financeRoutes);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/finance`;

  // Create isolated test user fixtures
  const userAEmail = `test.user.a.${Date.now()}@spendwise.ai`;
  const userBEmail = `test.user.b.${Date.now()}@spendwise.ai`;

  const userA = await User.create({
    fullName: 'Test User A',
    email: userAEmail,
    password: 'Password123!Secure'
  });

  const userB = await User.create({
    fullName: 'Test User B',
    email: userBEmail,
    password: 'Password123!Secure'
  });

  const tokenA = generateToken({ userId: userA._id.toString(), email: userA.email });
  const tokenB = generateToken({ userId: userB._id.toString(), email: userB.email });

  t.after(async () => {
    // Clean up test data
    await Finance.deleteMany({ userId: { $in: [userA._id, userB._id] } });
    await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });

    // Wait for the HTTP server to close
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    // Close MongoDB connection
    await mongoose.disconnect();
  });

  // Test 1: Unauthenticated access
  await t.test('1. Unauthenticated requests are rejected with 401', async () => {
    // GET without token
    const getRes = await fetch(baseUrl, { method: 'GET' });
    assert.equal(getRes.status, 401);
    const getData = await getRes.json();
    assert.equal(getData.success, false);
    assert.ok(getData.message.includes('Authentication required'));

    // PUT without token
    const putRes = await fetch(baseUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: [] })
    });
    assert.equal(putRes.status, 401);

    // GET with forged token
    const forgedRes = await fetch(baseUrl, {
      method: 'GET',
      headers: { Authorization: 'Bearer forged.invalid.token' }
    });
    assert.equal(forgedRes.status, 401);
  });

  // Test 2: Retrieval before creation returns 404
  await t.test('2. GET /api/finance returns 404 when no document exists yet', async () => {
    const res = await fetch(baseUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.includes('Financial document not found'));
  });

  // Test 3: Creation via PUT (upsert)
  await t.test('3. PUT /api/finance creates initial document using MongoDB upsert', async () => {
    const initialPayload = {
      transactions: [
        {
          id: 'tx-101',
          description: 'Client Consultation',
          category: 'Freelancing',
          type: 'income',
          amount: 25000,
          date: '2026-11-20',
          paymentMethod: 'Bank Transfer',
          notes: 'Sprint payment'
        }
      ],
      budgets: {
        Food: { limit: 12000 },
        Housing: { limit: 20000 }
      },
      savingsGoals: [
        {
          id: 'goal-1',
          name: 'Tech Upgrade',
          category: 'Electronics',
          targetAmount: 80000,
          savedAmount: 20000,
          targetDate: '2027-02-01',
          description: 'New workstation'
        }
      ],
      loans: [
        {
          id: 'loan-1',
          name: 'Device EMI',
          loanType: 'Personal Loan',
          lender: 'HDFC',
          principal: 50000,
          balance: 35000,
          interestRate: 11.5,
          startDate: '2026-01-10',
          tenureMonths: 12,
          emi: 4430
        }
      ],
      subscriptions: [
        {
          id: 'sub-1',
          name: 'Cloud Dev Seat',
          provider: 'GitHub',
          category: 'Software',
          amount: 800,
          frequency: 'Monthly',
          status: 'Active'
        }
      ]
    };

    const res = await fetch(baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify(initialPayload)
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.finance);
    assert.equal(data.finance.userId, userA._id.toString());
    assert.equal(data.finance.transactions.length, 1);
    assert.equal(data.finance.transactions[0].description, 'Client Consultation');
    assert.equal(data.finance.budgets.Food.limit, 12000);
    assert.equal(data.finance.savingsGoals.length, 1);
    assert.equal(data.finance.loans.length, 1);
    assert.equal(data.finance.subscriptions.length, 1);
  });

  // Test 4: Retrieval via GET after creation
  await t.test('4. GET /api/finance retrieves the created financial document', async () => {
    const res = await fetch(baseUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.finance.userId, userA._id.toString());
    assert.equal(data.finance.transactions.length, 1);
    assert.equal(data.finance.transactions[0].amount, 25000);
    assert.equal(data.finance.budgets.Housing.limit, 20000);
  });

  // Test 5: Updates via PUT
  await t.test('5. PUT /api/finance updates existing document correctly', async () => {
    const updatePayload = {
      transactions: [
        {
          id: 'tx-101',
          description: 'Client Consultation',
          category: 'Freelancing',
          type: 'income',
          amount: 25000,
          date: '2026-11-20',
          paymentMethod: 'Bank Transfer'
        },
        {
          id: 'tx-102',
          description: 'Dinner with team',
          category: 'Food',
          type: 'expense',
          amount: 2400,
          date: '2026-11-21',
          paymentMethod: 'UPI'
        }
      ],
      budgets: {
        Food: { limit: 15000 },
        Housing: { limit: 20000 },
        Travel: { limit: 6000 }
      }
    };

    const res = await fetch(baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify(updatePayload)
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.finance.transactions.length, 2);
    assert.equal(data.finance.budgets.Food.limit, 15000);
    assert.equal(data.finance.budgets.Travel.limit, 6000);
  });

  // Test 6: Validation Errors
  await t.test('6. Validation errors are handled properly (returns 400)', async () => {
    // Non-object body
    const arrayBodyRes = await fetch(baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify(['invalid_array'])
    });
    assert.equal(arrayBodyRes.status, 400);

    // No allowed fields provided
    const emptyFieldsRes = await fetch(baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ unknownField: 'test' })
    });
    assert.equal(emptyFieldsRes.status, 400);

    // Invalid transaction type
    const invalidTypeRes = await fetch(baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        transactions: [
          {
            description: 'Bad Type',
            category: 'Food',
            type: 'invalid_category_type',
            amount: 100,
            date: '2026-11-20'
          }
        ]
      })
    });
    assert.equal(invalidTypeRes.status, 400);
    const typeData = await invalidTypeRes.json();
    assert.equal(typeData.success, false);
    assert.ok(typeData.message.includes('Validation failed'));

    // Negative transaction amount
    const negativeAmountRes = await fetch(baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        transactions: [
          {
            description: 'Negative item',
            category: 'Food',
            type: 'expense',
            amount: -50,
            date: '2026-11-20'
          }
        ]
      })
    });
    assert.equal(negativeAmountRes.status, 400);

    // Negative budget limit
    const negativeBudgetRes = await fetch(baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        budgets: {
          Food: { limit: -200 }
        }
      })
    });
    assert.equal(negativeBudgetRes.status, 400);

    // Invalid subscription billing frequency
    const invalidFreqRes = await fetch(baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        subscriptions: [
          {
            name: 'Gym',
            provider: 'FitClub',
            category: 'Fitness',
            amount: 1500,
            frequency: 'Hourly' // Not allowed enum
          }
        ]
      })
    });
    assert.equal(invalidFreqRes.status, 400);
  });

  // Test 7: User Isolation & Security
  await t.test('7. Complete user isolation and protection against tampering', async () => {
    // 1. User B cannot see User A's financial document
    const userBGet = await fetch(baseUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert.equal(userBGet.status, 404, 'User B has no document and cannot see User A data');

    // 2. User B attempts to pass User A's ID in body to overwrite User A's document
    const maliciousPayload = {
      userId: userA._id.toString(), // Attacker tries to hijack User A's record
      transactions: [
        {
          id: 'tx-hacked',
          description: 'Malicious Injected Transaction',
          category: 'Other',
          type: 'expense',
          amount: 999999,
          date: '2026-11-20'
        }
      ]
    };

    const userBPut = await fetch(baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`
      },
      body: JSON.stringify(maliciousPayload)
    });

    assert.equal(userBPut.status, 200);
    const userBPutData = await userBPut.json();

    // Verify document was created for User B, NOT User A
    assert.equal(userBPutData.finance.userId, userB._id.toString());
    assert.notEqual(userBPutData.finance.userId, userA._id.toString());

    // 3. Verify User A's document was completely unaltered
    const userAVerify = await fetch(baseUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert.equal(userAVerify.status, 200);
    const userAData = await userAVerify.json();
    assert.equal(userAData.finance.userId, userA._id.toString());
    assert.equal(userAData.finance.transactions.length, 2); // Still 2 original transactions
    assert.ok(
      !userAData.finance.transactions.some((t) => t.id === 'tx-hacked'),
      "User A's document must not contain User B's injected transaction"
    );
  });
});
