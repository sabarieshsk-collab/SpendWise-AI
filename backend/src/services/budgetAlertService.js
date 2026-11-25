/**
 * SpendWise AI - Budget Alert Automation Service
 * 
 * Evaluates category budget utilization on finance mutations (transaction create/update/delete, budget create/update),
 * determines threshold crossings (50%, 80%, 100%), and dispatches alert webhooks asynchronously to n8n.
 * 
 * Alert Reset Policy:
 * - One alert per threshold ('50', '80', '100') per category envelope per calendar month ('YYYY-MM').
 * - Alert key format: `${userId}_${category}_${month}_${threshold}`.
 * - Upward threshold progression is supported (50 -> 80 -> 100).
 * - Downward budget adjustments or transaction deletions do not reset already-sent alert records.
 * - Downstream PostgreSQL enforces idempotency via UNIQUE constraint on alert_key.
 */

import mongoose from 'mongoose';
import User from '../models/User.js';

// Format validator for YYYY-MM
const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

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
 * Masks an email address for safe logging (e.g. john.doe@example.com -> j***e@example.com)
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
 * Generates the canonical alertKey matching PostgreSQL reservation logic and n8n expressions.
 * Rule: `${userId}_${category}_${month}_${threshold}`
 * 
 * @param {string} userId
 * @param {string} category
 * @param {string} month ('YYYY-MM')
 * @param {string} threshold ('50' | '80' | '100')
 * @returns {string} e.g. "6745ef12a34b_Housing_2026-11_80"
 */
export const generateAlertKey = (userId, category, month, threshold) => {
  const cleanUser = String(userId || '').trim();
  const cleanCat = String(category || '').trim();
  const cleanM = String(month || '').trim();
  const cleanTh = String(threshold || '').trim().replace(/%/g, '');
  return `${cleanUser}_${cleanCat}_${cleanM}_${cleanTh}`;
};

/**
 * Evaluates monthly expenses against budgeted categories for a target calendar month.
 * 
 * @param {Array} transactions Array of transaction objects
 * @param {Map|Object} budgets Map or Object of category budget envelopes
 * @param {string} [targetMonth] Optional target month (YYYY-MM). Defaults to current calendar month.
 * @returns {Array<Object>} List of eligible alert evaluations
 */
export const evaluateBudgetUtilization = (transactions = [], budgets = {}, targetMonth = null) => {
  const currentMonth = targetMonth || new Date().toISOString().slice(0, 7);

  // Normalize budgets into an array of [category, limit] pairs
  let budgetEntries = [];
  if (budgets instanceof Map) {
    budgetEntries = Array.from(budgets.entries()).map(([cat, item]) => [
      cat,
      typeof item === 'object' && item !== null ? Number(item.limit || 0) : Number(item || 0)
    ]);
  } else if (budgets && typeof budgets === 'object') {
    budgetEntries = Object.entries(budgets).map(([cat, item]) => [
      cat,
      typeof item === 'object' && item !== null ? Number(item.limit || 0) : Number(item || 0)
    ]);
  }

  // Filter out envelopes with no allocation limit
  const activeBudgets = budgetEntries.filter(([_, limit]) => Number.isFinite(limit) && limit > 0);
  if (activeBudgets.length === 0) {
    return [];
  }

  // Aggregate current-month expense transactions by category
  // Only transactions of type 'expense' belonging to the target month are counted
  const expenseTotals = new Map();

  for (const tx of transactions) {
    if (!tx || typeof tx !== 'object') continue;

    // Filter strictly for expense transactions (exclude income)
    const txType = String(tx.type || '').toLowerCase().trim();
    if (txType !== 'expense') continue;

    // Extract YYYY-MM from transaction date
    const txDate = String(tx.date || '').trim();
    let txMonth = '';
    if (MONTH_REGEX.test(txDate.slice(0, 7))) {
      txMonth = txDate.slice(0, 7);
    } else {
      const parsed = new Date(txDate);
      if (!isNaN(parsed.getTime())) {
        txMonth = parsed.toISOString().slice(0, 7);
      }
    }

    if (txMonth !== currentMonth) continue;

    const catKey = String(tx.category || '').trim().toLowerCase();
    const amount = Number(tx.amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    expenseTotals.set(catKey, (expenseTotals.get(catKey) || 0) + amount);
  }

  const results = [];

  for (const [categoryName, budgetLimit] of activeBudgets) {
    const cleanCat = String(categoryName).trim();
    const catLookup = cleanCat.toLowerCase();
    const spentAmount = expenseTotals.get(catLookup) || 0;

    // Calculate unrounded utilization
    const rawUtilization = (spentAmount / budgetLimit) * 100;
    const utilizationPercentage = Math.round(rawUtilization * 10) / 10;

    // Determine highest threshold tier met
    let threshold = null;
    let alertLevel = null;

    if (rawUtilization >= 100) {
      threshold = '100';
      alertLevel = 'CRITICAL';
    } else if (rawUtilization >= 80) {
      threshold = '80';
      alertLevel = 'WARNING';
    } else if (rawUtilization >= 50) {
      threshold = '50';
      alertLevel = 'NOTICE';
    }

    results.push({
      category: cleanCat,
      month: currentMonth,
      budgetAmount: budgetLimit,
      spentAmount,
      rawUtilization,
      utilizationPercentage,
      threshold,
      alertLevel,
      isAlertEligible: Boolean(threshold)
    });
  }

  return results;
};

/**
 * Dispatches an alert evaluation to the n8n webhook endpoint with timeout and secret authentication.
 * 
 * @param {Object} alertCandidate Evaluated candidate from evaluateBudgetUtilization
 * @param {Object} user Authenticated user record ({ id, fullName, email })
 * @returns {Promise<Object>} Dispatch result
 */
export const dispatchAlertWebhook = async (alertCandidate, user) => {
  if (!alertCandidate || !alertCandidate.isAlertEligible) {
    return { success: true, alertTriggered: false, message: 'Candidate not eligible for alert (<50%).' };
  }

  // Ensure authenticated user identity
  const cleanUserId = String(user?.id || user?._id || '').trim();
  const cleanUserName = String(user?.fullName || user?.name || 'SpendWise User').trim();
  const cleanEmail = validateEmail(user?.email);

  if (!cleanUserId || !cleanEmail) {
    console.warn(`[Budget Alert] Skipping webhook dispatch: Invalid user identity or email (userId: "${cleanUserId}", email: "${cleanEmail}")`);
    return { success: false, error: 'Valid user ID and email are required for alert dispatch.' };
  }

  const webhookUrl = process.env.SPENDWISE_N8N_WEBHOOK_URL;
  const webhookSecret = process.env.SPENDWISE_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    console.warn('[Budget Alert] Skipping webhook dispatch: SPENDWISE_N8N_WEBHOOK_URL or SPENDWISE_WEBHOOK_SECRET is not configured.');
    return { success: false, error: 'Automation webhook configuration missing on server.' };
  }

  const {
    category,
    month,
    budgetAmount,
    spentAmount,
    utilizationPercentage,
    threshold,
    alertLevel
  } = alertCandidate;

  const alertKey = generateAlertKey(cleanUserId, category, month, threshold);
  const remainingAmount = Math.max(0, budgetAmount - spentAmount);
  const overspentAmount = Math.max(0, spentAmount - budgetAmount);
  const nowIso = new Date().toISOString();

  const webhookPayload = {
    event: 'budget_threshold_alert',
    email: cleanEmail,
    userId: cleanUserId,
    user_id: cleanUserId,
    userName: cleanUserName,
    user_name: cleanUserName,
    category,
    month,
    budgetAmount,
    budget_amount: budgetAmount,
    spentAmount,
    spent_amount: spentAmount,
    remainingAmount,
    remaining_amount: remainingAmount,
    overspentAmount,
    overspent_amount: overspentAmount,
    utilizationPercentage,
    utilization_percentage: utilizationPercentage,
    utilizationPercent: utilizationPercentage,
    utilization_percent: utilizationPercentage,
    threshold,
    alertLevel,
    alert_level: alertLevel,
    alertKey,
    alert_key: alertKey,
    status: 'pending',
    currency: 'INR',
    triggeredAt: nowIso,
    created_at: nowIso,
    reserved_at: nowIso
  };

  const parsedTimeout = Number(process.env.SPENDWISE_WEBHOOK_TIMEOUT_MS);
  const timeoutMs = Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 25000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log(
      `[Budget Alert Trigger] Dispatching automated alert: alertKey="${alertKey}" | Utilization: ${utilizationPercentage}% (${threshold}) | Recipient: ${maskEmail(cleanEmail)}`
    );

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SpendWise-Webhook-Secret': webhookSecret,
        'User-Agent': 'SpendWise-Backend/1.0'
      },
      body: JSON.stringify(webhookPayload),
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
        `[Budget Alert Webhook Error] Upstream n8n webhook responded with HTTP ${response.status} | AlertKey: ${alertKey} | Diagnostics: ${errorBody}`
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
      // Non-JSON response is acceptable if status was 200
    }

    const isDuplicate = responseData?.status === 'duplicate_skipped';
    if (isDuplicate) {
      console.log(`[Budget Alert] Alert skipped by downstream PostgreSQL deduplication: alertKey="${alertKey}"`);
    } else {
      console.log(`[Budget Alert] Alert successfully accepted by n8n automation pipeline: alertKey="${alertKey}"`);
    }

    return {
      success: true,
      alertTriggered: true,
      alertKey,
      threshold,
      isDuplicate,
      responseData
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`[Budget Alert Webhook Timeout] n8n webhook call timed out after ${timeoutMs}ms for alertKey="${alertKey}".`);
      return { success: false, status: 504, error: 'Automation webhook request timed out.' };
    }

    console.error(`[Budget Alert Webhook Network Error] Failed to reach webhook for alertKey="${alertKey}":`, error.message || error);
    return { success: false, status: 502, error: 'Failed to reach automation webhook.' };
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Asynchronously processes and dispatches budget alerts for an updated finance document.
 * Designed to run in background (via setImmediate) without blocking finance HTTP responses.
 * 
 * @param {Object} financeDoc Updated Mongoose Finance document
 * @param {Object} authUser Safe authenticated user object from req.user
 * @param {string} [targetMonth] Optional calendar month override (YYYY-MM)
 * @returns {Promise<Array<Object>>} Dispatch results
 */
export const processFinanceAlertsAsync = async (financeDoc, authUser, targetMonth = null) => {
  try {
    if (!financeDoc || !authUser) return [];

    // Ensure we have fresh user details including email
    let user = authUser;
    const candidateId = authUser.id || authUser._id;
    if ((!user.email || !user.fullName) && mongoose.Types.ObjectId.isValid(candidateId)) {
      try {
        const dbUser = await User.findById(candidateId);
        if (dbUser) {
          user = dbUser.toSafeJSON ? dbUser.toSafeJSON() : dbUser;
        }
      } catch {
        // Fall back to provided user object
      }
    }

    if (!user?.email) {
      console.warn(`[Budget Alert] Cannot process alerts for user ${authUser.id || authUser._id}: Missing email address.`);
      return [];
    }

    // Extract transactions and budgets from the finance document
    const transactions = financeDoc.transactions || [];
    const budgets = financeDoc.budgets || {};

    const evaluations = evaluateBudgetUtilization(transactions, budgets, targetMonth);
    const eligibleCandidates = evaluations.filter((e) => e.isAlertEligible);

    if (eligibleCandidates.length === 0) {
      return [];
    }

    const dispatchPromises = eligibleCandidates.map((candidate) =>
      dispatchAlertWebhook(candidate, user)
    );

    const results = await Promise.all(dispatchPromises);
    return results;
  } catch (error) {
    console.error('[Budget Alert] Unexpected error in processFinanceAlertsAsync:', error.message || error);
    return [];
  }
};

export default {
  evaluateBudgetUtilization,
  dispatchAlertWebhook,
  processFinanceAlertsAsync,
  generateAlertKey,
  validateEmail,
  maskEmail
};
