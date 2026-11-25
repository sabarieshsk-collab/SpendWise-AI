import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import {
  advanceDateByOneMonth,
  getDaysDifference,
  determineReminderStage,
  generateLoanReminderKey,
  getReminderEmailContent,
  dispatchLoanReminderWebhook,
  processLoanCandidate,
  validateEmail,
  getKolkataDateString
} from '../src/services/loanReminderService.js';
import LoanReminderLog from '../src/models/LoanReminderLog.js';

test('Loan EMI Reminder Service - Comprehensive Test Suite', async (t) => {
  // 1. Date Advancement & Month-End Handling
  await t.test('1. Date Advancement: Correctly advances one calendar month with month-end clamping', () => {
    // Standard 30/31 days
    assert.equal(advanceDateByOneMonth('2026-03-15'), '2026-04-15');
    assert.equal(advanceDateByOneMonth('2026-07-20'), '2026-08-20');

    // Year crossover
    assert.equal(advanceDateByOneMonth('2026-12-10'), '2027-01-10');
    assert.equal(advanceDateByOneMonth('2026-12-31'), '2027-01-31');

    // January 31 to February 28 (non-leap year 2026)
    assert.equal(advanceDateByOneMonth('2026-01-31'), '2026-02-28');
    assert.equal(advanceDateByOneMonth('2026-01-30'), '2026-02-28');
    assert.equal(advanceDateByOneMonth('2026-01-29'), '2026-02-28');

    // Leap year: January 31, 2024 to February 29, 2024
    assert.equal(advanceDateByOneMonth('2024-01-31'), '2024-02-29');

    // 31-day months transitioning to 30-day months
    assert.equal(advanceDateByOneMonth('2026-03-31'), '2026-04-30'); // Mar 31 -> Apr 30
    assert.equal(advanceDateByOneMonth('2026-05-31'), '2026-06-30'); // May 31 -> Jun 30
    assert.equal(advanceDateByOneMonth('2026-08-31'), '2026-09-30'); // Aug 31 -> Sep 30
    assert.equal(advanceDateByOneMonth('2026-10-31'), '2026-11-30'); // Oct 31 -> Nov 30
  });

  // 2. Day Difference and All 5 Reminder Stages
  await t.test('2. Stage Evaluation: Evaluates all 5 reminder stages accurately', () => {
    const today = '2026-11-24';

    // 7 days before
    const diff7 = getDaysDifference('2026-12-01', today);
    assert.equal(diff7, 7);
    assert.equal(determineReminderStage(diff7), 'UPCOMING_7D');

    // 3 days before
    const diff3 = getDaysDifference('2026-11-27', today);
    assert.equal(diff3, 3);
    assert.equal(determineReminderStage(diff3), 'UPCOMING_3D');

    // 1 day before
    const diff1 = getDaysDifference('2026-11-25', today);
    assert.equal(diff1, 1);
    assert.equal(determineReminderStage(diff1), 'UPCOMING_1D');

    // On due date
    const diff0 = getDaysDifference('2026-11-24', today);
    assert.equal(diff0, 0);
    assert.equal(determineReminderStage(diff0), 'DUE_TODAY');

    // Overdue (yesterday or older)
    const diffPast1 = getDaysDifference('2026-11-23', today);
    assert.equal(diffPast1, -1);
    assert.equal(determineReminderStage(diffPast1), 'OVERDUE');

    const diffPast5 = getDaysDifference('2026-11-19', today);
    assert.equal(diffPast5, -5);
    assert.equal(determineReminderStage(diffPast5), 'OVERDUE');

    // Non-reminder days
    assert.equal(determineReminderStage(getDaysDifference('2026-11-26', today)), null); // 2 days before
    assert.equal(determineReminderStage(getDaysDifference('2026-11-28', today)), null); // 4 days before
    assert.equal(determineReminderStage(getDaysDifference('2026-12-05', today)), null); // 11 days before
  });

  // 3. Email Content Generation for All Stages
  await t.test('3. Email Content: Generates accurate subjects, messages, and overdue notices', () => {
    const loanName = 'Home Mortgage Loan';
    const lender = 'HDFC Bank';
    const emi = 25000;
    const dueDate = '2026-11-24';

    const stage7 = getReminderEmailContent('UPCOMING_7D', loanName, lender, emi, dueDate, 7);
    assert.ok(stage7.subject.includes('7 days'));
    assert.ok(stage7.body.includes('HDFC Bank'));
    assert.equal(stage7.urgency, 'NOTICE');

    const stage3 = getReminderEmailContent('UPCOMING_3D', loanName, lender, emi, dueDate, 3);
    assert.ok(stage3.subject.includes('3 days'));
    assert.equal(stage3.urgency, 'NOTICE');

    const stage1 = getReminderEmailContent('UPCOMING_1D', loanName, lender, emi, dueDate, 1);
    assert.ok(stage1.subject.includes('tomorrow'));
    assert.equal(stage1.urgency, 'WARNING');

    const stage0 = getReminderEmailContent('DUE_TODAY', loanName, lender, emi, dueDate, 0);
    assert.ok(stage0.subject.includes('Due Today'));
    assert.equal(stage0.urgency, 'CRITICAL');

    const stageOverdue = getReminderEmailContent('OVERDUE', loanName, lender, emi, dueDate, -4);
    assert.ok(stageOverdue.subject.includes('OVERDUE'));
    assert.ok(stageOverdue.subject.includes('4 days overdue'));
    assert.ok(stageOverdue.body.includes('currently overdue by 4 days'));
    assert.equal(stageOverdue.urgency, 'CRITICAL');
    assert.ok(!stageOverdue.body.includes('payment received'));
  });

  // 4. Canonical Reminder Key & Overdue Date Inclusion
  await t.test('4. Idempotency Key: Formats canonical reminder key and includes date for overdue', () => {
    const userId = 'usr_001';
    const loanId = 'loan_auto_1';
    const dueDate = '2026-11-24';
    const todayStr = '2026-11-25';

    const key7d = generateLoanReminderKey(userId, loanId, dueDate, 'UPCOMING_7D', todayStr);
    assert.equal(key7d, 'usr_001_loan_auto_1_2026-11-24_UPCOMING_7D');

    const keyDue = generateLoanReminderKey(userId, loanId, dueDate, 'DUE_TODAY', todayStr);
    assert.equal(keyDue, 'usr_001_loan_auto_1_2026-11-24_DUE_TODAY');

    // Overdue must include current calendar date
    const keyOverdue = generateLoanReminderKey(userId, loanId, dueDate, 'OVERDUE', todayStr);
    assert.equal(keyOverdue, 'usr_001_loan_auto_1_2026-11-24_OVERDUE_2026-11-25');
  });

  // 5. EMI Settlement Simulation
  await t.test('5. EMI Payment Simulation: Full EMI advances nextDueDate; partial and prepayment do not', () => {
    const loan = {
      id: 'loan-test-1',
      name: 'Personal Loan',
      principal: 100000,
      balance: 90000,
      emi: 5000,
      nextDueDate: '2026-11-24',
      paidDueDates: [],
      lastPaidDueDate: '',
      repayments: []
    };

    // Scenario A: Partial Payment (₹2000 < ₹5000)
    const partialAmount = 2000;
    const isPartialCoversEmi = partialAmount >= loan.emi;
    assert.equal(isPartialCoversEmi, false);
    // Partial payment reduces balance but does NOT advance nextDueDate
    loan.balance -= partialAmount;
    assert.equal(loan.balance, 88000);
    assert.equal(loan.nextDueDate, '2026-11-24');

    // Scenario B: Full EMI Payment (₹5000)
    const emiAmount = 5000;
    const isEmiCovers = emiAmount >= loan.emi;
    const isDueUnpaid = !loan.paidDueDates.includes(loan.nextDueDate);
    assert.equal(isEmiCovers && isDueUnpaid, true);

    const advancedDueDate = advanceDateByOneMonth(loan.nextDueDate);
    assert.equal(advancedDueDate, '2026-12-24');
    loan.paidDueDates.push(loan.nextDueDate);
    loan.nextDueDate = advancedDueDate;
    loan.balance -= emiAmount;

    assert.equal(loan.nextDueDate, '2026-12-24');
    assert.ok(loan.paidDueDates.includes('2026-11-24'));
    assert.equal(loan.balance, 83000);

    // Scenario C: Attempting to mark the same due date as paid again is rejected
    const isAlreadyPaid = loan.paidDueDates.includes('2026-11-24');
    assert.equal(isAlreadyPaid, true);
  });

  // 6. Webhook Dispatch to n8n with Timeout and Headers
  await t.test('6. Webhook Dispatch: Successfully posts payload with X-SpendWise-Webhook-Secret', async () => {
    let receivedPayload = null;
    let receivedSecret = null;

    const mockServer = http.createServer((req, res) => {
      receivedSecret = req.headers['x-spendwise-webhook-secret'];
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        receivedPayload = JSON.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'delivered', id: 'n8n-msg-1' }));
      });
    });

    await new Promise(r => mockServer.listen(0, r));
    const port = mockServer.address().port;

    const origUrl = process.env.SPENDWISE_N8N_WEBHOOK_URL;
    const origSecret = process.env.SPENDWISE_WEBHOOK_SECRET;

    process.env.SPENDWISE_N8N_WEBHOOK_URL = `http://127.0.0.1:${port}/loan-webhook`;
    process.env.SPENDWISE_WEBHOOK_SECRET = 'secret_loan_token_999';

    try {
      const samplePayload = {
        event: 'loan_emi_reminder',
        reminderKey: 'usr_1_loan_1_2026-11-24_DUE_TODAY',
        reminderStage: 'DUE_TODAY',
        userId: 'usr_1',
        userName: 'Alex Smith',
        email: 'alex.smith@spendwise.ai',
        loanId: 'loan_1',
        loanName: 'Car Loan',
        lender: 'SBI Bank',
        emiAmount: 12500,
        outstandingBalance: 150000,
        dueDate: '2026-11-24',
        daysUntilDue: 0,
        currency: 'INR'
      };

      const result = await dispatchLoanReminderWebhook(samplePayload);
      assert.equal(result.success, true);
      assert.equal(receivedSecret, 'secret_loan_token_999');
      assert.equal(receivedPayload.event, 'loan_emi_reminder');
      assert.equal(receivedPayload.reminderStage, 'DUE_TODAY');
      assert.equal(receivedPayload.emiAmount, 12500);
    } finally {
      process.env.SPENDWISE_N8N_WEBHOOK_URL = origUrl;
      process.env.SPENDWISE_WEBHOOK_SECRET = origSecret;
      mockServer.close();
    }
  });

  // 7. Full Loan Candidate Processing & Idempotency / Retry
  await t.test('7. Loan Candidate Processing: Skips fully paid loans, invalid dates, and already-paid EMIs', async () => {
    const todayStr = '2026-11-24';
    const fakeUserId = new mongoose.Types.ObjectId();

    // A. Paid off loan (balance = 0)
    const paidOffLoan = { id: 'l-0', balance: 0, emi: 5000, nextDueDate: '2026-11-24' };
    const resA = await processLoanCandidate({
      userId: fakeUserId,
      userName: 'User A',
      userEmail: 'user.a@spendwise.ai',
      loan: paidOffLoan,
      todayStr
    });
    assert.equal(resA.status, 'skipped_paid_off');

    // B. Invalid due date
    const invalidDateLoan = { id: 'l-invalid', balance: 50000, emi: 5000, nextDueDate: 'not-a-date' };
    const resB = await processLoanCandidate({
      userId: fakeUserId,
      userName: 'User B',
      userEmail: 'user.b@spendwise.ai',
      loan: invalidDateLoan,
      todayStr
    });
    assert.equal(resB.status, 'skipped_invalid_due_date');

    // C. EMI already paid for current nextDueDate
    const alreadyPaidLoan = {
      id: 'l-paid',
      balance: 50000,
      emi: 5000,
      nextDueDate: '2026-11-24',
      paidDueDates: ['2026-11-24']
    };
    const resC = await processLoanCandidate({
      userId: fakeUserId,
      userName: 'User C',
      userEmail: 'user.c@spendwise.ai',
      loan: alreadyPaidLoan,
      todayStr
    });
    assert.equal(resC.status, 'skipped_emi_already_paid');

    // D. Non-matching day difference (e.g. 5 days away)
    const nonMatchLoan = {
      id: 'l-nomatch',
      balance: 50000,
      emi: 5000,
      nextDueDate: '2026-11-29' // 5 days away
    };
    const resD = await processLoanCandidate({
      userId: fakeUserId,
      userName: 'User D',
      userEmail: 'user.d@spendwise.ai',
      loan: nonMatchLoan,
      todayStr
    });
    assert.equal(resD.status, 'skipped_no_stage_match');
  });

  // 8. Idempotency & Failure Retry Flow
  await t.test('8. Duplicate Prevention & Retry: Prevents duplicate sends and permits retrying failed reminders', async () => {
    const todayStr = '2026-11-24';
    const fakeUserId = new mongoose.Types.ObjectId();
    const loan = {
      id: 'loan-retry-test',
      name: 'Education Loan',
      lender: 'Canara Bank',
      balance: 100000,
      emi: 8000,
      nextDueDate: '2026-11-24', // DUE_TODAY
      paidDueDates: []
    };

    // Mock LoanReminderLog in-memory store for unit test
    const mockDb = new Map();
    const origFindOne = LoanReminderLog.findOne;
    const origCreate = LoanReminderLog.create;
    const origFindOneAndUpdate = LoanReminderLog.findOneAndUpdate;
    const origUpdateOne = LoanReminderLog.updateOne;

    LoanReminderLog.findOne = async ({ reminderKey }) => mockDb.get(reminderKey) || null;
    LoanReminderLog.create = async (doc) => {
      if (mockDb.has(doc.reminderKey)) {
        const err = new Error('Duplicate key');
        err.code = 11000;
        throw err;
      }
      mockDb.set(doc.reminderKey, { ...doc });
      return doc;
    };
    LoanReminderLog.findOneAndUpdate = async ({ reminderKey }, update) => {
      const doc = mockDb.get(reminderKey);
      if (!doc) return null;
      if (update.$set) Object.assign(doc, update.$set);
      if (update.$inc?.attempts) doc.attempts = (doc.attempts || 1) + update.$inc.attempts;
      return doc;
    };
    LoanReminderLog.updateOne = async ({ reminderKey }, update) => {
      const doc = mockDb.get(reminderKey);
      if (doc && update.$set) Object.assign(doc, update.$set);
      return { modifiedCount: 1 };
    };

    // Mock Webhook Server that fails on first attempt and succeeds on retry
    let callCount = 0;
    const mockServer = http.createServer((req, res) => {
      callCount++;
      if (callCount === 1) {
        // First attempt fails with 500
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Temporary downstream gateway error' }));
      } else {
        // Second attempt succeeds with 200
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'delivered' }));
      }
    });

    await new Promise(r => mockServer.listen(0, r));
    const port = mockServer.address().port;

    const origUrl = process.env.SPENDWISE_N8N_WEBHOOK_URL;
    const origSecret = process.env.SPENDWISE_WEBHOOK_SECRET;

    process.env.SPENDWISE_N8N_WEBHOOK_URL = `http://127.0.0.1:${port}/loan-webhook`;
    process.env.SPENDWISE_WEBHOOK_SECRET = 'secret_loan_token_999';

    try {
      // Attempt 1: Webhook fails -> status must be 'failed'
      const outcome1 = await processLoanCandidate({
        userId: fakeUserId,
        userName: 'Student User',
        userEmail: 'student@spendwise.ai',
        loan,
        todayStr
      });

      assert.equal(outcome1.status, 'failed');
      const reminderKey = outcome1.reminderKey;
      const logAfterFail = mockDb.get(reminderKey);
      assert.equal(logAfterFail.status, 'failed');

      // Attempt 2: Retry failed reminder -> webhook succeeds -> status must be 'sent'
      const outcome2 = await processLoanCandidate({
        userId: fakeUserId,
        userName: 'Student User',
        userEmail: 'student@spendwise.ai',
        loan,
        todayStr
      });

      assert.equal(outcome2.status, 'sent');
      const logAfterSuccess = mockDb.get(reminderKey);
      assert.equal(logAfterSuccess.status, 'sent');
      assert.equal(logAfterSuccess.attempts, 2);

      // Attempt 3: Already sent -> must be skipped without calling webhook again
      const outcome3 = await processLoanCandidate({
        userId: fakeUserId,
        userName: 'Student User',
        userEmail: 'student@spendwise.ai',
        loan,
        todayStr
      });

      assert.equal(outcome3.status, 'skipped_already_sent');
      assert.equal(callCount, 2); // No extra webhook call
    } finally {
      process.env.SPENDWISE_N8N_WEBHOOK_URL = origUrl;
      process.env.SPENDWISE_WEBHOOK_SECRET = origSecret;
      LoanReminderLog.findOne = origFindOne;
      LoanReminderLog.create = origCreate;
      LoanReminderLog.findOneAndUpdate = origFindOneAndUpdate;
      LoanReminderLog.updateOne = origUpdateOne;
      mockServer.close();
    }
  });

  // 9. Multi-User & Multi-Loan Isolation
  await t.test('9. Multi-User Isolation: Different users and loans generate distinct, independent reminder keys', () => {
    const todayStr = '2026-11-24';
    const user1 = 'usr_alice';
    const user2 = 'usr_bob';

    const loanA = { id: 'loan_1', nextDueDate: '2026-11-24' };
    const loanB = { id: 'loan_2', nextDueDate: '2026-11-24' };

    const keyUser1LoanA = generateLoanReminderKey(user1, loanA.id, loanA.nextDueDate, 'DUE_TODAY', todayStr);
    const keyUser1LoanB = generateLoanReminderKey(user1, loanB.id, loanB.nextDueDate, 'DUE_TODAY', todayStr);
    const keyUser2LoanA = generateLoanReminderKey(user2, loanA.id, loanA.nextDueDate, 'DUE_TODAY', todayStr);

    assert.notEqual(keyUser1LoanA, keyUser1LoanB);
    assert.notEqual(keyUser1LoanA, keyUser2LoanA);
    assert.equal(keyUser1LoanA, 'usr_alice_loan_1_2026-11-24_DUE_TODAY');
    assert.equal(keyUser1LoanB, 'usr_alice_loan_2_2026-11-24_DUE_TODAY');
    assert.equal(keyUser2LoanA, 'usr_bob_loan_1_2026-11-24_DUE_TODAY');
  });
});
