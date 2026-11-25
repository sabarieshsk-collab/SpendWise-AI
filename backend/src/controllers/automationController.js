/**
 * SpendWise AI - Smart Budget Alert Automation Controller (Email-Based Workflow)
 * Handles backend validation, email validation, threshold determination using unrounded utilization,
 * canonical alertKey generation for PostgreSQL reservation, and secure webhook forwarding to n8n.
 */

// Format validator for YYYY-MM
const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/

// RFC 5322-compliant standard email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

/**
 * Validates and normalizes an email address.
 * Rejects missing, non-string, empty, or improperly formatted email strings.
 *
 * @param {string} email
 * @returns {string|null} Trimmed, lowercased email string or null if invalid
 */
export const validateEmail = (email) => {
  if (email === undefined || email === null) return null
  if (typeof email !== 'string') return null
  const clean = email.trim().toLowerCase()
  if (!clean || clean.length > 254) return null
  if (!EMAIL_REGEX.test(clean)) return null
  return clean
}

/**
 * Generates the canonical alertKey matching PostgreSQL reservation logic and n8n expressions.
 * Rule: `${userId}_${category}_${month}_${threshold}`
 * - userId: trimmed string (exact case preserved)
 * - category: trimmed string (exact case preserved)
 * - month: trimmed YYYY-MM string
 * - threshold: exact threshold representation ('50', '80', or '100' without '%' symbol)
 * - delimiter: single underscore '_'
 *
 * @param {string} userId
 * @param {string} category
 * @param {string} month
 * @param {string} threshold ('50' | '80' | '100')
 * @returns {string} e.g. "usr_101_Housing_2026-11_80"
 */
export const generateAlertKey = (userId, category, month, threshold) => {
  const cleanUser = String(userId || '').trim()
  const cleanCat = String(category || '').trim()
  const cleanM = String(month || '').trim()
  const cleanTh = String(threshold || '').trim().replace(/%/g, '')
  return `${cleanUser}_${cleanCat}_${cleanM}_${cleanTh}`
}

/**
 * Masks an email address for safe logging (e.g., john.doe@example.com -> j***e@example.com)
 *
 * @param {string} email
 * @returns {string}
 */
const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '***'
  const parts = email.split('@')
  if (parts.length !== 2) return '***'
  const [user, domain] = parts
  const maskedUser = user.length <= 2 ? `${user[0]}*` : `${user[0]}***${user[user.length - 1]}`
  return `${maskedUser}@${domain}`
}

/**
 * POST /api/automation/budget-alert
 * Validates budget metrics and email recipient, evaluates unrounded threshold eligibility (50, 80, 100),
 * generates canonical alertKey, and forwards alert data to the n8n email alert webhook pipeline.
 */
export const handleBudgetAlert = async (req, res, next) => {
  try {
    const payload = req.body

    // 1. Basic payload object validation
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body. Expected a JSON object.',
      })
    }

    const rawUserId = req.user?.id || payload.userId
    const rawUserName = req.user?.fullName || payload.userName
    const rawEmail = req.user?.email || payload.email
    const { category, month, budgetAmount, spentAmount } = payload

    // 2. Validate userId
    if (!rawUserId || typeof rawUserId !== 'string' || rawUserId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Field "userId" is required and must be a non-empty string.',
      })
    }
    const cleanUserId = rawUserId.trim()
    if (cleanUserId.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Field "userId" exceeds maximum allowed length (100 characters).',
      })
    }

    // 3. Validate userName
    if (!rawUserName || typeof rawUserName !== 'string' || rawUserName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Field "userName" is required and must be a non-empty string.',
      })
    }
    const cleanUserName = rawUserName.trim()
    if (cleanUserName.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Field "userName" exceeds maximum allowed length (100 characters).',
      })
    }

    // 4. Validate category
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Field "category" is required and must be a non-empty string.',
      })
    }
    const cleanCategory = category.trim()
    if (cleanCategory.length > 80) {
      return res.status(400).json({
        success: false,
        error: 'Field "category" exceeds maximum allowed length (80 characters).',
      })
    }

    // 5. Validate month (strict YYYY-MM format)
    if (!month || typeof month !== 'string' || !MONTH_REGEX.test(month.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Field "month" is required and must be in YYYY-MM format (e.g. "2026-11").',
      })
    }
    const cleanMonth = month.trim()

    // 6. Validate and normalize email address
    const cleanEmail = validateEmail(rawEmail)
    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        error:
          'Field "email" is required and must be a valid email address (e.g. "user@example.com").',
      })
    }

    // 7. Validate budgetAmount (must be > 0)
    if (budgetAmount === undefined || budgetAmount === null) {
      return res.status(400).json({
        success: false,
        error: 'Field "budgetAmount" is required.',
      })
    }
    const numBudget = Number(budgetAmount)
    if (!Number.isFinite(numBudget) || numBudget <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Field "budgetAmount" must be a positive number greater than 0.',
      })
    }

    // 8. Validate spentAmount (must be >= 0)
    if (spentAmount === undefined || spentAmount === null) {
      return res.status(400).json({
        success: false,
        error: 'Field "spentAmount" is required.',
      })
    }
    const numSpent = Number(spentAmount)
    if (!Number.isFinite(numSpent) || numSpent < 0) {
      return res.status(400).json({
        success: false,
        error: 'Field "spentAmount" must be a non-negative number (>= 0).',
      })
    }

    // 9. Calculate utilization: evaluate unrounded value against thresholds, round only for display
    const rawUtilization = (numSpent / numBudget) * 100
    const utilizationPercentage = Math.round(rawUtilization * 10) / 10

    // 10. Determine threshold tier: compare unrounded utilization value
    let threshold = null
    let alertLevel = null

    if (rawUtilization >= 100) {
      threshold = '100'
      alertLevel = 'CRITICAL'
    } else if (rawUtilization >= 80) {
      threshold = '80'
      alertLevel = 'WARNING'
    } else if (rawUtilization >= 50) {
      threshold = '50'
      alertLevel = 'NOTICE'
    }

    // Rule: Do not send alerts below 50% unrounded utilization
    if (!threshold) {
      return res.status(200).json({
        success: true,
        alertTriggered: false,
        utilizationPercentage,
        threshold: null,
        message: 'Budget utilization is below 50%. No alert required or sent.',
      })
    }

    // 11. Strictly enforce server-generated alertKey (Never trust caller-controlled payload.alertKey or payload.alert_key)
    // Canonical format: `${userId}_${category}_${month}_${threshold}`
    const alertKey = generateAlertKey(cleanUserId, cleanCategory, cleanMonth, threshold)

    // 12. Read environment variables securely on backend only
    const webhookUrl = process.env.SPENDWISE_N8N_WEBHOOK_URL
    const webhookSecret = process.env.SPENDWISE_WEBHOOK_SECRET

    // Rule: If webhook URL or secret is missing, return HTTP 503
    if (!webhookUrl || !webhookSecret) {
      console.warn(
        '[Automation Controller] Alert triggered but SPENDWISE_N8N_WEBHOOK_URL or SPENDWISE_WEBHOOK_SECRET is not configured.'
      )
      return res.status(503).json({
        success: false,
        error: 'Automation service is currently unavailable. Webhook configuration is missing on server.',
      })
    }

    // 13. Construct outgoing JSON payload matching n8n email workflow & PostgreSQL spendwise_alerts schema
    const remainingAmount = Math.max(0, numBudget - numSpent)
    const overspentAmount = Math.max(0, numSpent - numBudget)
    const nowIso = new Date().toISOString()

    const webhookPayload = {
      event: 'budget_threshold_alert',
      email: cleanEmail,
      userId: cleanUserId,
      user_id: cleanUserId,
      userName: cleanUserName,
      user_name: cleanUserName,
      category: cleanCategory,
      month: cleanMonth,
      budgetAmount: numBudget,
      budget_amount: numBudget,
      spentAmount: numSpent,
      spent_amount: numSpent,
      remainingAmount,
      remaining_amount: remainingAmount,
      overspentAmount,
      overspent_amount: overspentAmount,
      utilizationPercentage,
      utilization_percentage: utilizationPercentage,
      utilizationPercent: utilizationPercentage,
      utilization_percent: utilizationPercentage,
      threshold, // Exactly '50', '80', or '100' without '%'
      alertLevel, // Separate: 'NOTICE', 'WARNING', or 'CRITICAL'
      alert_level: alertLevel,
      alertKey,
      alert_key: alertKey,
      status: 'pending', // Neon constraint: CHECK (status IN ('pending', 'sent', 'failed'))
      currency: 'INR',
      triggeredAt: nowIso,
      created_at: nowIso,
      reserved_at: nowIso,
    }

    // 14. Forward alert data with timeout handling and authentication header
    const parsedTimeout = Number(process.env.SPENDWISE_WEBHOOK_TIMEOUT_MS)
    const WEBHOOK_TIMEOUT_MS =
      Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 25000

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)

    try {
      try {
        console.log(
          `[Budget Alert] Dispatching alert event: alertKey="${alertKey}" | Utilization: ${utilizationPercentage}% (${threshold}) | Recipient: ${maskEmail(cleanEmail)}`
        )

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-SpendWise-Webhook-Secret': webhookSecret,
            'User-Agent': 'SpendWise-Backend/1.0',
          },
          body: JSON.stringify(webhookPayload),
          signal: controller.signal,
        })

        if (!response.ok) {
          let errorBody = ''
          try {
            const rawText = await response.text()
            // Safely truncate to max 500 characters
            errorBody = rawText ? rawText.slice(0, 500).trim() : 'No response body returned'
          } catch {
            errorBody = 'Could not read response body'
          }

          // Sanitize any sensitive credentials if reflected in upstream error traces
          if (webhookSecret && errorBody.includes(webhookSecret)) {
            errorBody = errorBody.replaceAll(webhookSecret, '[REDACTED]')
          }

          console.error(
            `[Budget Alert Webhook Error] Upstream n8n webhook responded with HTTP ${response.status} | Diagnostics: ${errorBody}`
          )

          return res.status(502).json({
            success: false,
            error: `Upstream automation webhook returned status ${response.status}.`,
          })
        }

        // Safe success response: Reports alert forwarding without claiming email delivery
        return res.status(200).json({
          success: true,
          alertTriggered: true,
          alertKey,
          threshold,
          alertLevel,
          utilizationPercentage,
          email: cleanEmail,
          message: 'Budget alert event processed and forwarded to automation webhook.',
        })
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          console.error(
            `[Budget Alert Webhook Timeout] n8n webhook call timed out after ${WEBHOOK_TIMEOUT_MS}ms.`
          )
          return res.status(504).json({
            success: false,
            error: 'Automation webhook request timed out. Upstream service did not respond.',
          })
        }

        console.error('[Budget Alert Webhook Network Error]', fetchError.message || fetchError)
        return res.status(502).json({
          success: false,
          error: 'Failed to reach automation webhook. Service may be unreachable or offline.',
        })
      }
    } finally {
      clearTimeout(timeout)
    }
  } catch (error) {
    console.error('[Automation Controller Unexpected Error]', error.message || error)
    return next(error)
  }
}
