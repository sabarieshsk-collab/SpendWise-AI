/**
 * SpendWise AI - Automated Loan EMI Email Reminder Service
 * 
 * Runs a daily scheduled scan at 8:00 AM (Asia/Kolkata) using node-cron.
 * Scans active loans with outstanding balance, evaluates calendar-day differences against nextDueDate,
 * and dispatches authenticated webhook notifications to n8n for:
 *   - 7 days before (UPCOMING_7D)
 *   - 3 days before (UPCOMING_3D)
 *   - 1 day before (UPCOMING_1D)
 *   - Due date (DUE_TODAY)
 *   - Past due date while unpaid (OVERDUE)
 * 
 * Provides strict atomic reservation and idempotency via LoanReminderLog to prevent duplicate emails.
 */

import cron from 'node-cron';
import Finance from '../models/Finance.js';
import User from '../models/User.js';
import LoanReminderLog from '../models/LoanReminderLog.js';
import { isDBConnected } from '../config/db.js';

// Format validator for YYYY-MM-DD
export const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// RFC 5322-compliant standard email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates and normalizes an email address.
 * 
 * @param {string} email
 * @returns {string|null} Trimmed, lowercased email string or null if invalid
 */
export const validateEmail = (email) => {
  if (email === undefined || email === null) return null;
  if (typeof email !== 'string') return null;
  const clean = email.trim().toLowerCase();
  if (!clean || clean.length > 254) return null;
  if (!EMAIL_REGEX.test(clean)) return null;
  return clean;
};

/**
 * Masks an email address for safe logging.
 * 
 * @param {string} email
 * @returns {string}
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '***';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const [user, domain] = parts;
  const maskedUser = user.length <= 2 ? `${user[0]}*` : `${user[0]}***${user[user.length - 1]}`;
  return `${maskedUser}@${domain}`;
};

/**
 * Returns current calendar date string in Asia/Kolkata timezone (YYYY-MM-DD).
 * 
 * @param {Date} [date=new Date()]
 * @returns {string} e.g. "2026-11-24"
 */
export const getKolkataDateString = (date = new Date()) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

/**
 * Calculates calendar day difference between due date and current date (dueDate - today).
 * Positive means future, zero means today, negative means overdue.
 * 
 * @param {string} dueDateStr 'YYYY-MM-DD'
 * @param {string} todayDateStr 'YYYY-MM-DD'
 * @returns {number}
 */
export const getDaysDifference = (dueDateStr, todayDateStr) => {
  if (!DATE_REGEX.test(dueDateStr) || !DATE_REGEX.test(todayDateStr)) {
    return NaN;
  }
  const [dY, dM, dD] = dueDateStr.split('-').map(Number);
  const [tY, tM, tD] = todayDateStr.split('-').map(Number);
  const dueUtc = Date.UTC(dY, dM - 1, dD);
  const todayUtc = Date.UTC(tY, tM - 1, tD);
  return Math.round((dueUtc - todayUtc) / (24 * 60 * 60 * 1000));
};

/**
 * Advances a YYYY-MM-DD date by exactly one calendar month,
 * correctly clamping to the last valid day of the target month (e.g. Jan 31 -> Feb 28/29).
 * 
 * @param {string} dateStr 'YYYY-MM-DD'
 * @returns {string} Next month's YYYY-MM-DD
 */
export const advanceDateByOneMonth = (dateStr) => {
  if (!DATE_REGEX.test(dateStr)) return dateStr;
  const [y, m, d] = dateStr.split('-').map(Number);
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  // Last day of target month: Date(year, monthIndex, 0)
  const maxDays = new Date(nextY, nextM, 0).getDate();
  const nextD = Math.min(d, maxDays);
  return `${nextY}-${String(nextM).padStart(2, '0')}-${String(nextD).padStart(2, '0')}`;
};

/**
 * Determines reminder stage based on days until due date.
 * 
 * @param {number} daysUntilDue
 * @returns {'UPCOMING_7D' | 'UPCOMING_3D' | 'UPCOMING_1D' | 'DUE_TODAY' | 'OVERDUE' | null}
 */
export const determineReminderStage = (daysUntilDue) => {
  if (daysUntilDue === 7) return 'UPCOMING_7D';
  if (daysUntilDue === 3) return 'UPCOMING_3D';
  if (daysUntilDue === 1) return 'UPCOMING_1D';
  if (daysUntilDue === 0) return 'DUE_TODAY';
  if (daysUntilDue < 0) return 'OVERDUE';
  return null;
};

/**
 * Generates canonical reminderKey for deduplication.
 * Rule: ${userId}_${loanId}_${dueDate}_${stage}
 * For OVERDUE reminders, appends the evaluation calendar date to limit overdue alerts to 1 per day.
 * 
 * @param {string} userId
 * @param {string} loanId
 * @param {string} dueDate
 * @param {string} stage
 * @param {string} todayDateStr
 * @returns {string}
 */
export const generateLoanReminderKey = (userId, loanId, dueDate, stage, todayDateStr) => {
  const cleanUser = String(userId || '').trim();
  const cleanLoan = String(loanId || '').trim();
  const cleanDue = String(dueDate || '').trim();
  if (stage === 'OVERDUE') {
    return `${cleanUser}_${cleanLoan}_${cleanDue}_OVERDUE_${todayDateStr}`;
  }
  return `${cleanUser}_${cleanLoan}_${cleanDue}_${stage}`;
};

/**
 * Builds email subject and structured message content for loan reminders.
 * 
 * @param {string} stage
 * @param {string} loanName
 * @param {string} lender
 * @param {number} emiAmount
 * @param {string} dueDate
 * @param {number} daysUntilDue
 * @returns {{ subject: string, heading: string, body: string, urgency: string }}
 */
export const getReminderEmailContent = (stage, loanName, lender, emiAmount, dueDate, daysUntilDue) => {
  const formattedEmi = `₹${Number(emiAmount).toLocaleString('en-IN')}`;
  switch (stage) {
    case 'UPCOMING_7D':
      return {
        subject: `Upcoming EMI Reminder: ${loanName} (${formattedEmi}) due in 7 days`,
        heading: `Upcoming Loan EMI Payment Reminder`,
        body: `Your monthly EMI of ${formattedEmi} for ${loanName} with ${lender} is due in 7 days on ${dueDate}. Please ensure adequate balance in your account.`,
        urgency: 'NOTICE'
      };
    case 'UPCOMING_3D':
      return {
        subject: `Upcoming EMI Reminder: ${loanName} (${formattedEmi}) due in 3 days`,
        heading: `Loan EMI Payment Due in 3 Days`,
        body: `Friendly reminder that your monthly EMI of ${formattedEmi} for ${loanName} with ${lender} is due on ${dueDate}. Please arrange the payment to avoid late charges.`,
        urgency: 'NOTICE'
      };
    case 'UPCOMING_1D':
      return {
        subject: `Urgent: ${loanName} EMI (${formattedEmi}) is due tomorrow`,
        heading: `Loan EMI Due Tomorrow`,
        body: `Your monthly EMI of ${formattedEmi} for ${loanName} with ${lender} is due tomorrow on ${dueDate}. Please ensure payment is scheduled.`,
        urgency: 'WARNING'
      };
    case 'DUE_TODAY':
      return {
        subject: `Due Today: ${loanName} EMI Payment (${formattedEmi})`,
        heading: `Loan EMI Payment Due Today`,
        body: `Your monthly EMI of ${formattedEmi} for ${loanName} with ${lender} is due today, ${dueDate}. Please complete the payment today to keep your account current.`,
        urgency: 'CRITICAL'
      };
    case 'OVERDUE': {
      const overdueDays = Math.abs(daysUntilDue);
      return {
        subject: `OVERDUE ALERT: ${loanName} EMI Payment (${formattedEmi}) is ${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`,
        heading: `Action Required: Loan EMI Payment Overdue`,
        body: `Your monthly EMI of ${formattedEmi} for ${loanName} with ${lender} was due on ${dueDate} and is currently overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}. Please record or settle your payment immediately to avoid penalty fees and credit score impact.`,
        urgency: 'CRITICAL'
      };
    }
    default:
      return null;
  }
};

/**
 * Dispatches loan reminder webhook payload to n8n with timeout handling.
 * 
 * @param {Object} payload
 * @returns {Promise<{ success: boolean, status?: number, error?: string, responseData?: any }>}
 */
export const dispatchLoanReminderWebhook = async (payload) => {
  const webhookUrl = process.env.SPENDWISE_N8N_WEBHOOK_URL;
  const webhookSecret = process.env.SPENDWISE_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    console.warn('[Loan Reminder] Skipping webhook dispatch: SPENDWISE_N8N_WEBHOOK_URL or SPENDWISE_WEBHOOK_SECRET not configured.');
    return { success: false, error: 'Automation webhook configuration missing on server.' };
  }

  const parsedTimeout = Number(process.env.SPENDWISE_WEBHOOK_TIMEOUT_MS);
  const timeoutMs = Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 25000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SpendWise-Webhook-Secret': webhookSecret,
        'User-Agent': 'SpendWise-Backend/1.0'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      let errorBody = '';
      try {
        const rawText = await response.text();
        errorBody = rawText ? rawText.slice(0, 500).trim() : 'No response body';
      } catch {
        errorBody = 'Could not read response body';
      }

      if (webhookSecret && errorBody.includes(webhookSecret)) {
        errorBody = errorBody.replaceAll(webhookSecret, '[REDACTED]');
      }

      console.error(
        `[Loan Reminder Webhook Error] Upstream n8n returned HTTP ${response.status} for reminderKey="${payload.reminderKey}" | Diagnostics: ${errorBody}`
      );

      return {
        success: false,
        status: response.status,
        error: `Upstream automation webhook returned status ${response.status}.`
      };
    }

    let responseData = null;
    try {
      responseData = await response.json();
    } catch {
      // Non-JSON 200 response accepted
    }

    return {
      success: true,
      status: response.status,
      responseData
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`[Loan Reminder Webhook Timeout] Webhook call timed out after ${timeoutMs}ms for reminderKey="${payload.reminderKey}".`);
      return { success: false, status: 504, error: 'Automation webhook request timed out.' };
    }
    console.error(`[Loan Reminder Webhook Network Error] Failed to reach webhook for reminderKey="${payload.reminderKey}":`, error.message || error);
    return { success: false, status: 502, error: error.message || 'Failed to reach automation webhook.' };
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Processes a single loan candidate for reminders with atomic reservation and status tracking.
 * 
 * @param {Object} params
 * @returns {Promise<{ status: string, reminderKey?: string, stage?: string, error?: string }>}
 */
export const processLoanCandidate = async ({
  userId,
  userName,
  userEmail,
  loan,
  todayStr
}) => {
  // 1. Validate loan status and balance
  const balance = Number(loan?.balance || 0);
  if (balance <= 0) {
    return { status: 'skipped_paid_off' };
  }

  // 2. Validate due date
  const dueDate = loan?.nextDueDate ? String(loan.nextDueDate).trim() : '';
  if (!DATE_REGEX.test(dueDate)) {
    return { status: 'skipped_invalid_due_date' };
  }

  // 3. Check if EMI for this due date was already marked paid
  const paidDueDates = Array.isArray(loan.paidDueDates) ? loan.paidDueDates : [];
  if (paidDueDates.includes(dueDate)) {
    return { status: 'skipped_emi_already_paid' };
  }

  // 4. Calculate day difference and determine stage
  const daysUntilDue = getDaysDifference(dueDate, todayStr);
  const stage = determineReminderStage(daysUntilDue);
  if (!stage) {
    return { status: 'skipped_no_stage_match', daysUntilDue };
  }

  // 5. Generate canonical reminder key
  const reminderKey = generateLoanReminderKey(userId, loan.id, dueDate, stage, todayStr);

  // 6. Atomic Reservation / State Machine in MongoDB
  const existingLog = await LoanReminderLog.findOne({ reminderKey });
  if (existingLog && existingLog.status === 'sent') {
    return { status: 'skipped_already_sent', reminderKey, stage };
  }

  let logDoc = null;
  if (!existingLog) {
    try {
      logDoc = await LoanReminderLog.create({
        reminderKey,
        userId,
        loanId: loan.id,
        dueDate,
        reminderStage: stage,
        status: 'reserved',
        attempts: 1,
        lastAttemptAt: new Date()
      });
    } catch (err) {
      if (err.code === 11000) {
        // Concurrent scheduler execution already reserved this key
        return { status: 'skipped_concurrency_lock', reminderKey, stage };
      }
      throw err;
    }
  } else if (existingLog.status === 'failed') {
    // Retry failed reminder
    logDoc = await LoanReminderLog.findOneAndUpdate(
      { reminderKey, status: 'failed' },
      {
        $set: { status: 'reserved', lastAttemptAt: new Date(), error: null },
        $inc: { attempts: 1 }
      },
      { new: true }
    );
    if (!logDoc) return { status: 'skipped_concurrency_lock', reminderKey, stage };
  } else if (existingLog.status === 'reserved') {
    // Check if the reservation is stale (> 5 minutes ago)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (existingLog.lastAttemptAt < fiveMinutesAgo) {
      logDoc = await LoanReminderLog.findOneAndUpdate(
        { reminderKey, status: 'reserved', lastAttemptAt: { $lt: fiveMinutesAgo } },
        { $set: { lastAttemptAt: new Date() }, $inc: { attempts: 1 } },
        { new: true }
      );
      if (!logDoc) return { status: 'skipped_concurrency_lock', reminderKey, stage };
    } else {
      // Actively being processed
      return { status: 'skipped_in_progress', reminderKey, stage };
    }
  }

  // 7. Prepare payload
  const emailContent = getReminderEmailContent(
    stage,
    loan.name,
    loan.lender,
    loan.emi,
    dueDate,
    daysUntilDue
  );

  const payload = {
    event: 'loan_emi_reminder',
    reminderKey,
    reminderStage: stage,
    userId: String(userId),
    userName,
    email: userEmail,
    loanId: loan.id,
    loanName: loan.name,
    lender: loan.lender,
    emiAmount: loan.emi,
    outstandingBalance: balance,
    dueDate,
    daysUntilDue,
    currency: 'INR',
    subject: emailContent.subject,
    heading: emailContent.heading,
    message: emailContent.body,
    urgency: emailContent.urgency,
    triggeredAt: new Date().toISOString()
  };

  // 8. Dispatch Webhook
  console.log(
    `[Loan Reminder] Dispatching ${stage} reminder: reminderKey="${reminderKey}" | Loan: "${loan.name}" | Recipient: ${maskEmail(userEmail)}`
  );

  const dispatchResult = await dispatchLoanReminderWebhook(payload);

  if (dispatchResult.success) {
    await LoanReminderLog.updateOne(
      { reminderKey },
      {
        $set: {
          status: 'sent',
          sentAt: new Date(),
          error: null,
          payload
        }
      }
    );
    return { status: 'sent', reminderKey, stage, dispatchResult };
  } else {
    await LoanReminderLog.updateOne(
      { reminderKey },
      {
        $set: {
          status: 'failed',
          error: dispatchResult.error || 'Failed to dispatch webhook',
          payload
        }
      }
    );
    return { status: 'failed', reminderKey, stage, error: dispatchResult.error };
  }
};

/**
 * Executes a full scan of all active loans across all users.
 * Can be run by the scheduler or invoked manually in tests/admin endpoints.
 * 
 * @param {Object} [options={}]
 * @param {string} [options.targetDateStr] Override evaluation calendar date (YYYY-MM-DD)
 * @returns {Promise<{ totalScanned: number, totalRemindersSent: number, totalFailed: number, details: Array<any> }>}
 */
export const runLoanReminderScan = async (options = {}) => {
  const todayStr = options.targetDateStr || getKolkataDateString();
  console.log(`[Loan Reminder] Starting daily scan for calendar date ${todayStr} (Asia/Kolkata)...`);

  if (!isDBConnected()) {
    console.warn('[Loan Reminder] Database not connected. Skipping scan.');
    return { totalScanned: 0, totalRemindersSent: 0, totalFailed: 0, details: [] };
  }

  const results = {
    totalScanned: 0,
    totalRemindersSent: 0,
    totalFailed: 0,
    details: []
  };

  try {
    // Find all finance documents that have at least one loan with balance > 0
    const financeDocs = await Finance.find({
      'loans.balance': { $gt: 0 }
    });

    for (const financeDoc of financeDocs) {
      if (!financeDoc.userId) continue;

      // Fetch authentic user details directly from MongoDB
      let user = null;
      try {
        user = await User.findById(financeDoc.userId);
      } catch (userErr) {
        console.warn(`[Loan Reminder] Failed to lookup user ${financeDoc.userId}: ${userErr.message}`);
        continue;
      }

      if (!user) continue;

      const userEmail = validateEmail(user.email);
      if (!userEmail) {
        console.warn(`[Loan Reminder] User ${user._id} has missing or invalid email. Skipping loans for this user.`);
        continue;
      }

      const userName = user.fullName || 'SpendWise User';
      const loans = financeDoc.loans || [];

      for (const loan of loans) {
        results.totalScanned++;
        try {
          const outcome = await processLoanCandidate({
            userId: user._id,
            userName,
            userEmail,
            loan,
            todayStr
          });

          results.details.push({
            userId: user._id,
            loanId: loan.id,
            loanName: loan.name,
            outcome
          });

          if (outcome.status === 'sent') {
            results.totalRemindersSent++;
          } else if (outcome.status === 'failed') {
            results.totalFailed++;
          }
        } catch (loanErr) {
          console.error(`[Loan Reminder] Error processing loan ${loan?.id}:`, loanErr.message);
          results.totalFailed++;
          results.details.push({
            loanId: loan?.id,
            error: loanErr.message
          });
        }
      }
    }

    console.log(
      `[Loan Reminder] Scan completed. Scanned: ${results.totalScanned} | Sent: ${results.totalRemindersSent} | Failed: ${results.totalFailed}`
    );
  } catch (scanError) {
    console.error('[Loan Reminder] Scan encountered critical error:', scanError.message);
  }

  return results;
};

// Scheduler singleton state
let schedulerTask = null;
let isSchedulerRunning = false;

/**
 * Starts the daily node-cron loan reminder scheduler at 8:00 AM Asia/Kolkata.
 * Prevents starting multiple times.
 */
export const startLoanReminderScheduler = () => {
  if (isSchedulerRunning) {
    console.log('[Loan Reminder Scheduler] Already running. Skipping duplicate start.');
    return;
  }

  // Cron schedule: 0 8 * * * (At 08:00 AM every day)
  // Timezone: Asia/Kolkata
  schedulerTask = cron.schedule(
    '0 8 * * *',
    async () => {
      console.log('[Loan Reminder Scheduler] Triggering daily 8:00 AM Asia/Kolkata scan...');
      try {
        await runLoanReminderScan();
      } catch (cronErr) {
        console.error('[Loan Reminder Scheduler] Error during scheduled scan:', cronErr.message);
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    }
  );

  isSchedulerRunning = true;
  console.log('[Loan Reminder Scheduler] Initialized daily cron job (08:00 AM Asia/Kolkata).');
};

/**
 * Stops the loan reminder scheduler if active.
 */
export const stopLoanReminderScheduler = () => {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    isSchedulerRunning = false;
    console.log('[Loan Reminder Scheduler] Stopped.');
  }
};

export default {
  startLoanReminderScheduler,
  stopLoanReminderScheduler,
  runLoanReminderScan,
  processLoanCandidate,
  determineReminderStage,
  generateLoanReminderKey,
  getReminderEmailContent,
  getDaysDifference,
  getKolkataDateString,
  advanceDateByOneMonth,
  validateEmail,
  maskEmail
};
