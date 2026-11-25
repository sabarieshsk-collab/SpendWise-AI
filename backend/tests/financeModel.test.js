import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Finance from '../src/models/Finance.js';

test('Finance Model Schema & Validation Tests', async (t) => {
  await t.test('Finance model requires userId', async () => {
    const doc = new Finance({});
    let err = null;
    try {
      await doc.validate();
    } catch (e) {
      err = e;
    }
    assert.ok(err, 'Expected validation error when userId is missing');
    assert.ok(err.errors.userId, 'userId error should be present');
  });

  await t.test('Finance model initializes with safe defaults (no fabricated records)', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();
    const doc = new Finance({ userId: fakeUserId });

    assert.equal(doc.userId.toString(), fakeUserId.toString());
    assert.deepEqual(doc.transactions.toObject(), []);
    assert.deepEqual(doc.savingsGoals.toObject(), []);
    assert.deepEqual(doc.loans.toObject(), []);
    assert.deepEqual(doc.subscriptions.toObject(), []);
    assert.equal(doc.budgets.size, 0);

    let err = null;
    try {
      await doc.validate();
    } catch (e) {
      err = e;
    }
    assert.equal(err, null, 'Document with safe defaults and userId should validate cleanly');
  });

  await t.test('Transactions subdocument validation', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();

    // Valid transaction
    const validDoc = new Finance({
      userId: fakeUserId,
      transactions: [
        {
          description: 'Grocery store',
          category: 'Food',
          type: 'expense',
          amount: 1500,
          date: '2026-11-20',
          paymentMethod: 'UPI'
        }
      ]
    });
    await validDoc.validate();

    // Invalid transaction type
    const invalidTypeDoc = new Finance({
      userId: fakeUserId,
      transactions: [
        {
          description: 'Salary',
          category: 'Salary',
          type: 'invalid_type',
          amount: 5000,
          date: '2026-11-01'
        }
      ]
    });
    let typeErr = null;
    try {
      await invalidTypeDoc.validate();
    } catch (e) {
      typeErr = e;
    }
    assert.ok(typeErr && typeErr.errors['transactions.0.type']);

    // Negative amount
    const negativeDoc = new Finance({
      userId: fakeUserId,
      transactions: [
        {
          description: 'Coffee',
          category: 'Food',
          type: 'expense',
          amount: -100,
          date: '2026-11-20'
        }
      ]
    });
    let amountErr = null;
    try {
      await negativeDoc.validate();
    } catch (e) {
      amountErr = e;
    }
    assert.ok(amountErr && amountErr.errors['transactions.0.amount']);
  });

  await t.test('Budgets Map subdocument validation', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();

    const doc = new Finance({
      userId: fakeUserId,
      budgets: {
        Food: { limit: 12000 },
        Housing: { limit: 25000 }
      }
    });

    await doc.validate();
    assert.equal(doc.budgets.get('Food').limit, 12000);

    // Negative budget limit
    const negativeBudgetDoc = new Finance({
      userId: fakeUserId,
      budgets: {
        Food: { limit: -500 }
      }
    });
    let budgetErr = null;
    try {
      await negativeBudgetDoc.validate();
    } catch (e) {
      budgetErr = e;
    }
    assert.ok(budgetErr);
  });

  await t.test('Savings Goals with contributions validation', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();

    const doc = new Finance({
      userId: fakeUserId,
      savingsGoals: [
        {
          name: 'Emergency Fund',
          category: 'Emergency Fund',
          targetAmount: 100000,
          savedAmount: 30000,
          targetDate: '2027-01-01',
          contributions: [
            {
              amount: 15000,
              date: '2026-11-10',
              note: 'Initial deposit'
            }
          ]
        }
      ]
    });

    await doc.validate();
    assert.equal(doc.savingsGoals[0].contributions.length, 1);
  });

  await t.test('Loans with repayments validation', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();

    const doc = new Finance({
      userId: fakeUserId,
      loans: [
        {
          name: 'Personal Loan',
          loanType: 'Personal Loan',
          lender: 'State Bank',
          principal: 50000,
          balance: 40000,
          interestRate: 10.5,
          startDate: '2026-01-01',
          tenureMonths: 24,
          emi: 2320,
          repayments: [
            {
              amount: 2320,
              date: '2026-02-01',
              method: 'Bank Transfer'
            }
          ]
        }
      ]
    });

    await doc.validate();
  });

  await t.test('Subscriptions validation', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();

    const doc = new Finance({
      userId: fakeUserId,
      subscriptions: [
        {
          name: 'Cloud Storage',
          provider: 'Google',
          category: 'Cloud Storage',
          amount: 210,
          frequency: 'Monthly',
          status: 'Active'
        }
      ]
    });

    await doc.validate();

    // Invalid frequency
    const invalidSubDoc = new Finance({
      userId: fakeUserId,
      subscriptions: [
        {
          name: 'Cloud Storage',
          provider: 'Google',
          category: 'Cloud Storage',
          amount: 210,
          frequency: 'Daily', // Not in allowed enum
          status: 'Active'
        }
      ]
    });

    let subErr = null;
    try {
      await invalidSubDoc.validate();
    } catch (e) {
      subErr = e;
    }
    assert.ok(subErr && subErr.errors['subscriptions.0.frequency']);
  });

  await t.test('userId schema path has unique constraint', () => {
    const userIdPath = Finance.schema.paths.userId;
    assert.equal(userIdPath.options.unique, true);
    assert.equal(userIdPath.options.ref, 'User');
  });
});
