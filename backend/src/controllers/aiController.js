import {
  getOpenRouterClient,
  isOpenRouterConfigured,
  getOpenRouterModel,
} from '../config/openrouter.js'

/**
 * Controller: Test OpenRouter Connectivity
 * POST /api/ai/test
 */
export const testAIConnection = async (req, res, next) => {
  try {
    const { message } = req.body

    // 1. Validate input payload
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Field "message" is required and must be a valid string.',
      })
    }

    const trimmedMessage = message.trim()
    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty.',
      })
    }

    if (trimmedMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Message exceeds the maximum length of 1,000 characters.',
      })
    }

    // 2. Verify OpenRouter configuration
    if (!isOpenRouterConfigured()) {
      return res.status(503).json({
        success: false,
        error:
          'OpenRouter API key is not configured. Please enter your valid key in backend/.env to enable live AI responses.',
      })
    }

    // 3. Obtain client and server-enforced model identifier
    const client = getOpenRouterClient()
    const model = getOpenRouterModel()

    // 4. Controlled system instruction (strictly isolated test message; no financial data sent)
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are the SpendWise AI backend connectivity verifier. Confirm that the secure OpenRouter proxy connection is active and functioning properly. Keep your reply concise, professional, and within 2-3 sentences.',
        },
        {
          role: 'user',
          content: trimmedMessage,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const reply = completion.choices?.[0]?.message?.content?.trim() || 'Connection confirmed.'

    return res.status(200).json({
      success: true,
      response: reply,
      model,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error.status === 401 || error.message?.includes('401') || error.message?.includes('User not found')) {
      return res.status(401).json({
        success: false,
        error:
          'Authentication failed with OpenRouter. Please check that OPENROUTER_API_KEY in backend/.env is valid.',
      })
    }

    if (error.status === 429 || error.message?.includes('429')) {
      return res.status(429).json({
        success: false,
        error: 'OpenRouter rate limit or credit quota exceeded. Please check your account balance.',
      })
    }

    return next(error)
  }
}

/**
 * Controller: Conversational AI Financial Assistant
 * POST /api/ai/chat
 */
export const handleAIChat = async (req, res, next) => {
  try {
    const { message, history = [], financialContext = {} } = req.body

    // 1. Validate incoming user message
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Field "message" is required and must be a valid string.',
      })
    }

    const trimmedMessage = message.trim()
    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty.',
      })
    }

    if (trimmedMessage.length > 1500) {
      return res.status(400).json({
        success: false,
        error: 'Message exceeds the maximum allowed length of 1,500 characters.',
      })
    }

    // 2. Validate OpenRouter configuration
    if (!isOpenRouterConfigured()) {
      return res.status(503).json({
        success: false,
        error:
          'OpenRouter API key is not configured. Please enter your valid key in backend/.env to enable live AI responses.',
      })
    }

    // 3. Sanitize and bound conversation history (max 8 turns to prevent prompt bloat)
    const sanitizedHistory = []
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-8)
      for (const item of recentHistory) {
        if (
          item &&
          (item.role === 'user' || item.role === 'assistant') &&
          typeof item.content === 'string'
        ) {
          sanitizedHistory.push({
            role: item.role,
            content: item.content.slice(0, 1000).trim(),
          })
        }
      }
    }

    // 4. Sanitize minimal financial context summary (numeric and aggregate demo values only)
    const fc = {
      period: typeof financialContext.period === 'string' ? financialContext.period : 'November 2026',
      income: Number(financialContext.periodIncome) || 0,
      expenses: Number(financialContext.periodExpenses) || 0,
      netCashFlow: Number(financialContext.periodNetCashFlow) || 0,
      allocatedBudget: Number(financialContext.totalAllocatedBudget) || 0,
      remainingBudget: Number(financialContext.remainingBudget) || 0,
      utilization: Number(financialContext.overallUtilization) || 0,
      totalSaved: Number(financialContext.totalAmountSaved) || 0,
      savingsTarget: Number(financialContext.totalSavingsTarget) || 0,
      completionPercent: Number(financialContext.overallGoalCompletionPercent) || 0,
      totalDebt: Number(financialContext.totalLoanOutstanding) || 0,
      monthlyEMI: Number(financialContext.monthlyEMICommitment) || 0,
      activeSubsCount: Number(financialContext.activeSubscriptionsCount) || 0,
      monthlySubCost: Number(financialContext.monthlyRecurringCost) || 0,
      topCategories: Array.isArray(financialContext.topCategories)
        ? financialContext.topCategories.slice(0, 5).map((c) => `${c.category}: ₹${Number(c.spent).toLocaleString('en-IN')}`).join(', ')
        : 'Housing, Food, Shopping, Utilities',
    }

    // 5. Server-controlled system instruction enforcing SpendWise identity and safety
    const systemPrompt = `You are SpendWise AI, an expert, encouraging, and highly analytical personal financial assistant for the SpendWise AI platform ("Smart Money. Smarter Decisions.").

CORE POLICIES & BOUNDARIES:
1. SAMPLE DATA CONTEXT: All financial numbers below are demonstration/synthetic data ("SAMPLE DATA"). Ground all answers in this context.
2. DETERMINISTIC TRUTH: Base all calculations, balances, spending figures, and metrics STRICTLY on the verified Financial Summary provided below. Do NOT invent new balances, fabricate ledger records, or guess numbers.
3. READ-ONLY SCOPE: You cannot directly create, edit, or delete transactions, budgets, savings goals, loans, or subscriptions. When asked to make modifications, politely guide the user to the appropriate page (Transactions, Budget Planner, Savings Goals, Loan Manager, Subscription Manager).
4. TONE & FORMAT: Use clean, professional GitHub-flavored Markdown. Bold key figures, use concise bullet points, and format currency amounts in Indian Rupees (e.g., ₹48,250). Keep responses focused, encouraging, and actionable (under 3-4 paragraphs).

VERIFIED FINANCIAL CONTEXT SUMMARY (${fc.period}):
• Monthly Income: ₹${fc.income.toLocaleString('en-IN')}
• Monthly Expenses: ₹${fc.expenses.toLocaleString('en-IN')}
• Net Cash Flow: ₹${fc.netCashFlow.toLocaleString('en-IN')}
• Budget Envelopes: ₹${fc.expenses.toLocaleString('en-IN')} spent of ₹${fc.allocatedBudget.toLocaleString('en-IN')} limit (${fc.utilization}% utilization, ₹${fc.remainingBudget.toLocaleString('en-IN')} remaining runway)
• Top Category Spending: ${fc.topCategories}
• Savings Milestones: ₹${fc.totalSaved.toLocaleString('en-IN')} saved towards ₹${fc.savingsTarget.toLocaleString('en-IN')} target (${fc.completionPercent}% complete)
• Outstanding Debt: ₹${fc.totalDebt.toLocaleString('en-IN')} total liability across loans (Monthly EMI: ₹${fc.monthlyEMI.toLocaleString('en-IN')})
• Recurring Subscriptions: ${fc.activeSubsCount} active plans costing ₹${fc.monthlySubCost.toLocaleString('en-IN')}/month (Annualized: ₹${(fc.monthlySubCost * 12).toLocaleString('en-IN')}/year)
`

    // 6. Obtain client & server-enforced model
    const client = getOpenRouterClient()
    const model = getOpenRouterModel()

    // 7. Call OpenRouter API
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...sanitizedHistory,
        { role: 'user', content: trimmedMessage },
      ],
      max_tokens: 700,
      temperature: 0.6,
    })

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      'I have reviewed your financial summary. What specific aspect would you like to explore further?'

    return res.status(200).json({
      success: true,
      response: reply,
      model,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[OpenRouter Chat Error]', error.message || error)

    if (error.status === 401 || error.message?.includes('401') || error.message?.includes('User not found')) {
      return res.status(401).json({
        success: false,
        error:
          'OpenRouter authentication failed. Please verify that OPENROUTER_API_KEY in backend/.env is valid.',
      })
    }

    if (error.status === 429 || error.message?.includes('429')) {
      return res.status(429).json({
        success: false,
        error: 'OpenRouter rate limit or credit quota reached. Please check your account credits.',
      })
    }

    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return res.status(504).json({
        success: false,
        error: 'The AI model took too long to respond. Please try your question again.',
      })
    }

    return next(error)
  }
}

/**
 * Controller: Deep AI Spending Diagnostic Analyzer
 * POST /api/ai/analyze-spending
 */
export const analyzeSpending = async (req, res, next) => {
  try {
    let spendingSummary = req.body
    if (req.body && req.body.spendingSummary !== undefined) {
      spendingSummary = req.body.spendingSummary
    }

    // 1. Validate payload
    if (!spendingSummary || typeof spendingSummary !== 'object' || Array.isArray(spendingSummary)) {
      return res.status(400).json({
        success: false,
        error: 'Payload "spendingSummary" is required and must be an object.',
      })
    }

    const {
      period = 'November 2026',
      totalSpending = 0,
      averageDailySpending = 0,
      effectiveDays = 1,
      highestCategory = {},
      largestTransaction = null,
      monthOverMonth = {},
      categories = [],
      patterns = [],
      unusualFindings = [],
      savingsOpportunities = {},
    } = spendingSummary

    // Verify non-negative total
    if (typeof totalSpending !== 'number' || totalSpending < 0) {
      return res.status(400).json({
        success: false,
        error: 'Field "totalSpending" must be a non-negative number.',
      })
    }

    // 2. Verify OpenRouter configuration
    if (!isOpenRouterConfigured()) {
      return res.status(503).json({
        success: false,
        error:
          'OpenRouter API key is not configured. Please enter your valid key in backend/.env to enable live AI responses.',
      })
    }

    // 3. Sanitize and prepare deterministic metrics for system instruction
    const sanitizedCategories = Array.isArray(categories)
      ? categories.slice(0, 10).map((c) => ({
          name: String(c.name || 'Unknown'),
          total: Number(c.total) || 0,
          percentage: Number(c.percentage) || 0,
          budgetLimit: Number(c.budgetLimit) || 0,
          utilization: c.utilization !== null && c.utilization !== undefined ? Number(c.utilization) : null,
          status: String(c.status || 'normal'),
        }))
      : []

    const sanitizedPatterns = Array.isArray(patterns)
      ? patterns.slice(0, 6).map((p) => ({
          title: String(p.title || ''),
          category: String(p.category || ''),
          data: String(p.supportingData || ''),
          explanation: String(p.explanation || ''),
          severity: String(p.severity || 'Medium'),
          action: String(p.suggestedAction || ''),
        }))
      : []

    const sanitizedUnusual = Array.isArray(unusualFindings)
      ? unusualFindings.slice(0, 5).map((u) => ({
          target: String(u.target || ''),
          category: String(u.category || ''),
          amount: Number(u.actualAmount) || 0,
          baseline: String(u.baseline || ''),
          rule: String(u.rule || ''),
          severity: String(u.severity || 'Notice'),
          action: String(u.suggestedAction || ''),
        }))
      : []

    const momText = monthOverMonth.hasSufficientData
      ? `${monthOverMonth.absoluteDiff >= 0 ? '+' : ''}₹${Math.abs(monthOverMonth.absoluteDiff || 0).toLocaleString('en-IN')} (${monthOverMonth.percentChange >= 0 ? '+' : ''}${monthOverMonth.percentChange || 0}%) compared to ${monthOverMonth.previousPeriodLabel || 'previous month'}`
      : 'Insufficient prior month ledger records to establish baseline comparison.'

    const categoryLines = sanitizedCategories
      .map(
        (c) =>
          `• ${c.name}: ₹${c.total.toLocaleString('en-IN')} (${c.percentage}% of spending)${
            c.budgetLimit > 0 ? ` [Budget: ₹${c.budgetLimit.toLocaleString('en-IN')}, Utilization: ${c.utilization}%]` : ''
          }`
      )
      .join('\n')

    const patternsLines = sanitizedPatterns.length > 0
      ? sanitizedPatterns
          .map((p) => `• [${p.severity}] ${p.title} (${p.category}): ${p.data}. Suggestion: ${p.action}`)
          .join('\n')
      : 'No concerning spending patterns detected.'

    const unusualLines = sanitizedUnusual.length > 0
      ? sanitizedUnusual
          .map((u) => `• [${u.severity}] ${u.target} (${u.category}) — ₹${u.amount.toLocaleString('en-IN')}. Rule: ${u.rule}. Baseline: ${u.baseline}`)
          .join('\n')
      : 'All expenses fall within standard statistical variances.'

    // 4. Construct server-enforced system prompt with financial accuracy constraints
    const systemPrompt = `You are SpendWise AI's Lead Financial Diagnostic Analyst. Tagline: "Smart Money. Smarter Decisions."

CORE ACCURACY & GOVERNANCE RULES:
1. STRICT TRUTH TO CALCULATED DATA: All monetary metrics below have been deterministically pre-calculated from verified ledger transactions. You MUST interpret, contextualize, and explain these numbers. You must NEVER invent new transactions, fabricate category totals, or guess percentages.
2. DO NOT LABEL ANOMALIES AS FRAUD: The unusual spending findings represent statistical mathematical deviations only (e.g. expenses above average or clustered transactions). Explicitly state that they represent statistical variances, not unauthorized or fraudulent charges.
3. CLEAR SAVINGS LABELING: Any potential savings suggestions must be explicitly labeled as "Estimated Potential Savings" rather than guaranteed savings.
4. RECONCILIATION INTEGRITY: Explicitly acknowledge that the category breakdown covers ${sanitizedCategories.length} tracked categories totaling ₹${totalSpending.toLocaleString('en-IN')}.
5. TONE & FORMAT: Provide an executive-level, professional, and visually engaging analysis in GitHub-flavored Markdown. Use Indian Rupee formatting (₹), bold key figures, structured headings, and crisp bullet points.

DETERMINISTIC SPENDING DATASET (${period}):
• Total Period Outflow: ₹${totalSpending.toLocaleString('en-IN')} (over ${effectiveDays} tracked days)
• Average Daily Spend: ₹${averageDailySpending.toLocaleString('en-IN')}/day
• Top Expense Category: ${highestCategory.name || 'None'} with ₹${(highestCategory.amount || 0).toLocaleString('en-IN')} (${highestCategory.percentage || 0}% of total spend)
• Largest Single Transaction: ${largestTransaction ? `${largestTransaction.description} (₹${(largestTransaction.amount || 0).toLocaleString('en-IN')} • ${largestTransaction.category})` : 'None logged'}
• Month-over-Month Variance: ${momText}
• Estimated Potential Savings: ~₹${(savingsOpportunities.totalPotential || 0).toLocaleString('en-IN')}/month

CATEGORY SPENDING BREAKDOWN:
${categoryLines || 'No category expenses logged.'}

IDENTIFIED BEHAVIORAL PATTERNS:
${patternsLines}

STATISTICAL ANOMALY DETECTIONS:
${unusualLines}
`

    const userPrompt = `Please generate a comprehensive, structured AI Financial Diagnostic Report for ${period}.

Include the following sections:
1. **Executive Spending Diagnosis**: Outflow cadence, daily burn rate, and month-over-month trajectory.
2. **Category Concentration & Budget Risk**: Analysis of dominant categories, envelope utilization, and budget discipline.
3. **Behavioral Patterns & Statistical Variances**: Explanation of detected micro-transaction velocity, anchor commitments, or clustered outlays (framed as mathematical observations, not fraud).
4. **Actionable Optimization Roadmap**: Quantified, realistic savings opportunities (clearly marked as estimates).`

    // 5. Obtain client and server-enforced model
    const client = getOpenRouterClient()
    const model = getOpenRouterModel()

    // 6. Call OpenRouter
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 850,
      temperature: 0.5,
    })

    const analysis =
      completion.choices?.[0]?.message?.content?.trim() ||
      'Spending analysis report successfully compiled based on deterministic ledger metrics.'

    return res.status(200).json({
      success: true,
      analysis,
      model,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[OpenRouter Spending Analysis Error]', error.message || error)

    if (error.status === 401 || error.message?.includes('401') || error.message?.includes('User not found')) {
      return res.status(401).json({
        success: false,
        error:
          'OpenRouter authentication failed. Please verify that OPENROUTER_API_KEY in backend/.env is valid.',
      })
    }

    if (error.status === 429 || error.message?.includes('429')) {
      return res.status(429).json({
        success: false,
        error: 'OpenRouter rate limit or credit quota reached. Please check your account credits.',
      })
    }

    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return res.status(504).json({
        success: false,
        error: 'The AI model took too long to complete the spending analysis. Please retry.',
      })
    }

    return next(error)
  }
}
