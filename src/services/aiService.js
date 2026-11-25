/**
 * SpendWise AI Financial Assistant - Frontend Service Layer
 * Connects to the secure Node.js + Express backend (/api/ai/chat)
 * powered by OpenRouter (NVIDIA Nemotron 3 Ultra / configured model).
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const SUGGESTED_QUESTIONS = [
  'How much did I spend this month?',
  'Which category has the highest expenses?',
  'Am I exceeding my budget?',
  'How much money can I save this month?',
  'What are my upcoming EMI payments?',
  'How much do my subscriptions cost?',
  'Give me suggestions to reduce expenses.',
  'How much loan balance do I have remaining?',
  'How much have I saved towards my goals?',
  'Give me a summary of my financial health.',
]

/**
 * Infer a short semantic badge category based on query contents
 */
const inferCategory = (query) => {
  const q = query.toLowerCase()
  if (q.includes('spend') || q.includes('expense')) return 'Spending Analysis'
  if (q.includes('budget') || q.includes('exceed')) return 'Budget Health'
  if (q.includes('save') || q.includes('goal') || q.includes('target')) return 'Savings Milestones'
  if (q.includes('emi') || q.includes('loan') || q.includes('debt')) return 'Debt Amortization'
  if (q.includes('sub') || q.includes('recurring')) return 'Recurring Costs'
  if (q.includes('health') || q.includes('summary')) return 'Financial Diagnostic'
  return 'AI Intelligence'
}

/**
 * Prepares a sanitized, minimal summary of financial context from FinanceContext.
 * Sends aggregate numbers only — no credentials, passwords, or personal details.
 */
export const extractFinancialContextSummary = (financeContext) => {
  if (!financeContext) return {}

  const { metrics = {}, activePeriod = {}, budgets = {} } = financeContext
  const periodCategorySpending = metrics.periodCategorySpending || {}

  const topCategories = Object.keys(periodCategorySpending)
    .map((cat) => ({
      category: cat,
      spent: periodCategorySpending[cat] || 0,
      budget: budgets[cat]?.limit || 0,
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5)

  return {
    period: activePeriod.label || 'November 2026',
    periodIncome: metrics.periodIncome || 0,
    periodExpenses: metrics.periodExpenses || 0,
    periodNetCashFlow: metrics.periodNetCashFlow || 0,
    totalAllocatedBudget: metrics.totalAllocatedBudget || 0,
    remainingBudget: metrics.remainingBudget || 0,
    overallUtilization: metrics.overallUtilization || 0,
    totalSavingsTarget: metrics.totalSavingsTarget || 0,
    totalAmountSaved: metrics.totalAmountSaved || 0,
    remainingSavingsAmount: metrics.remainingSavingsAmount || 0,
    overallGoalCompletionPercent: metrics.overallGoalCompletionPercent || 0,
    totalLoanPrincipal: metrics.totalLoanPrincipal || 0,
    totalLoanOutstanding: metrics.totalLoanOutstanding || 0,
    monthlyEMICommitment: metrics.monthlyEMICommitment || 0,
    activeSubscriptionsCount: metrics.activeSubscriptionsCount || 0,
    monthlyRecurringCost: metrics.monthlyRecurringCost || 0,
    topCategories,
  }
}

/**
 * Checks backend health status
 * @returns {Promise<{ ok: boolean, aiConfigured?: boolean, service?: string }>}
 */
export const checkBackendHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' })
    if (res.ok) {
      const data = await res.json()
      return { ok: true, ...data }
    }
    return { ok: false }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

/**
 * Sends a conversational query to the live Node.js + OpenRouter backend endpoint.
 *
 * @param {string} query
 * @param {object} financeContext
 * @param {Array} history - Previous message history during current session
 * @returns {Promise<{ text: string, category: string, model: string, timestamp: string }>}
 */
export const processFinancialQuery = async (query, financeContext, history = []) => {
  const financialContext = extractFinancialContextSummary(financeContext)

  // Map session messages to the backend history format (user/assistant role)
  const formattedHistory = history
    .filter((m) => m && m.id !== 'msg-welcome' && !m.isError)
    .map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }))
    .slice(-6)

  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        message: query.trim(),
        history: formattedHistory,
        financialContext,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      const errorMsg = data?.error || `Server responded with HTTP ${response.status}`
      throw new Error(errorMsg)
    }

    return {
      text: data.response,
      category: inferCategory(query),
      model: data.model || 'OpenRouter Model',
      timestamp: data.timestamp || new Date().toISOString(),
      isLive: true,
    }
  } catch (error) {
    console.error('[AI Assistant Service Error]:', error)

    // Check if error is network / server unreachable
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error(
        'Unable to reach SpendWise AI backend on port 5000. Please ensure the backend server is running (`npm run dev` in backend/ folder).'
      )
    }

    throw error
  }
}
