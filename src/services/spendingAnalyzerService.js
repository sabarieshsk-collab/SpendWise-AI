/**
 * SpendWise AI Spending Analyzer - Deterministic JavaScript Calculation & Rule Engine
 * Analyzes transaction histories, discovers patterns, detects unusual outlays,
 * evaluates budget envelopes and calculates Month-over-Month variances.
 */

// Helper: Format numbers in Indian numbering system
export const formatINR = (val) => {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0
  return `₹${Math.round(num).toLocaleString('en-IN')}`
}

/**
 * 1. Spending Overview Metrics
 */
export const calculateSpendingOverview = (transactions, period, allPeriods = []) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalSpending: 0,
      averageDailySpending: 0,
      highestCategory: { name: 'None', amount: 0, percentage: 0 },
      largestTransaction: null,
      monthOverMonth: {
        currentTotal: 0,
        previousTotal: 0,
        absoluteDiff: 0,
        percentChange: 0,
        hasSufficientData: false,
      },
      savingsOpportunities: {
        totalPotential: 0,
        breakdown: [],
      },
    }
  }

  // Filter expenses strictly within selected period
  const periodExpenses = transactions.filter(
    (tx) =>
      tx.type === 'expense' &&
      tx.date >= period.startDate &&
      tx.date <= period.endDate
  )

  const totalSpending = periodExpenses.reduce((sum, tx) => sum + tx.amount, 0)

  // Average Daily Spending (days elapsed or period length, safe denominator)
  const startDate = new Date(period.startDate)
  const endDate = new Date(period.endDate)
  const today = new Date('2026-11-19') // simulated current date
  let effectiveDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1)
  if (period.isCurrent && today >= startDate && today <= endDate) {
    effectiveDays = Math.max(1, Math.round((today - startDate) / (1000 * 60 * 60 * 24)) + 1)
  }
  const averageDailySpending = totalSpending > 0 ? Math.round(totalSpending / effectiveDays) : 0

  // Category totals for period
  const categoryTotals = {}
  periodExpenses.forEach((tx) => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount
  })

  // Highest spending category
  let highestCategory = { name: 'None', amount: 0, percentage: 0 }
  Object.keys(categoryTotals).forEach((cat) => {
    if (categoryTotals[cat] > highestCategory.amount) {
      highestCategory = {
        name: cat,
        amount: categoryTotals[cat],
        percentage: totalSpending > 0 ? Math.round((categoryTotals[cat] / totalSpending) * 100) : 0,
      }
    }
  })

  // Largest individual transaction
  const sortedExpenses = [...periodExpenses].sort((a, b) => b.amount - a.amount)
  const largestTransaction = sortedExpenses.length > 0 ? sortedExpenses[0] : null

  // Month-over-Month calculation against previous calendar period
  const currentIndex = allPeriods.findIndex((p) => p.id === period.id)
  const previousPeriod = allPeriods[currentIndex + 1] || null

  let monthOverMonth = {
    currentTotal: totalSpending,
    previousTotal: 0,
    absoluteDiff: 0,
    percentChange: 0,
    hasSufficientData: false,
    previousPeriodLabel: previousPeriod?.label || 'Previous Cycle',
  }

  if (previousPeriod) {
    const prevExpenses = transactions.filter(
      (tx) =>
        tx.type === 'expense' &&
        tx.date >= previousPeriod.startDate &&
        tx.date <= previousPeriod.endDate
    )

    const prevTotal = prevExpenses.reduce((sum, tx) => sum + tx.amount, 0)
    const diff = totalSpending - prevTotal
    const pctChange = prevTotal > 0 ? Math.round((diff / prevTotal) * 100) : 0

    monthOverMonth = {
      currentTotal: totalSpending,
      previousTotal: prevTotal,
      absoluteDiff: diff,
      percentChange: pctChange,
      hasSufficientData: prevExpenses.length > 0,
      previousPeriodLabel: previousPeriod.label,
    }
  }

  // Potential savings opportunities (discretionary categories + subscriptions optimization)
  const discretionarySpend =
    (categoryTotals['Food'] || 0) +
    (categoryTotals['Shopping'] || 0) +
    (categoryTotals['Entertainment'] || 0)

  const potentialDiscretionarySavings = Math.round(discretionarySpend * 0.15) // 15% trim recommendation
  const potentialSubscriptionSavings = categoryTotals['Subscriptions']
    ? Math.round((categoryTotals['Subscriptions'] || 0) * 0.25)
    : 0

  const totalPotential = potentialDiscretionarySavings + potentialSubscriptionSavings

  const savingsOpportunities = {
    totalPotential,
    breakdown: [
      {
        area: 'Discretionary Trimming (Dining & Shopping)',
        amount: potentialDiscretionarySavings,
        note: 'Optimizing non-essential dining and shopping runs by 15%',
      },
      {
        area: 'Subscription & Membership Audit',
        amount: potentialSubscriptionSavings,
        note: 'Consolidating duplicate streaming and dev passes',
      },
    ],
  }

  return {
    totalSpending,
    averageDailySpending,
    highestCategory,
    largestTransaction,
    monthOverMonth,
    savingsOpportunities,
    transactionCount: periodExpenses.length,
    effectiveDays,
  }
}

/**
 * 2. Category-wise Spending Analysis
 */
export const calculateCategoryAnalysis = (transactions, budgets = {}, period) => {
  const periodExpenses = transactions.filter(
    (tx) =>
      tx.type === 'expense' &&
      tx.date >= period.startDate &&
      tx.date <= period.endDate
  )

  const totalSpending = periodExpenses.reduce((sum, tx) => sum + tx.amount, 0)

  const categoryMap = {}
  periodExpenses.forEach((tx) => {
    if (!categoryMap[tx.category]) {
      categoryMap[tx.category] = {
        name: tx.category,
        total: 0,
        count: 0,
        transactions: [],
      }
    }
    categoryMap[tx.category].total += tx.amount
    categoryMap[tx.category].count += 1
    categoryMap[tx.category].transactions.push(tx)
  })

  // Also include budgeted categories that have 0 spend in this period
  Object.keys(budgets).forEach((cat) => {
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        name: cat,
        total: 0,
        count: 0,
        transactions: [],
      }
    }
  })

  const categories = Object.keys(categoryMap).map((catName) => {
    const item = categoryMap[catName]
    const budgetLimit = budgets[catName]?.limit || 0
    const percentage = totalSpending > 0 ? Math.round((item.total / totalSpending) * 100) : 0
    const avgTransaction = item.count > 0 ? Math.round(item.total / item.count) : 0
    const utilization = budgetLimit > 0 ? Math.round((item.total / budgetLimit) * 100) : null

    let status = 'normal'
    if (utilization !== null) {
      if (utilization >= 100) status = 'over'
      else if (utilization >= 80) status = 'warning'
      else if (utilization >= 50) status = 'progress'
    } else {
      status = 'unbudgeted'
    }

    return {
      name: catName,
      total: item.total,
      percentage,
      count: item.count,
      avgTransaction,
      budgetLimit,
      utilization,
      status,
      transactions: item.transactions,
    }
  })

  // Sort by highest spending descending
  categories.sort((a, b) => b.total - a.total)

  if (categories.length > 0 && categories[0].total > 0) {
    categories[0].isHighest = true
  }

  return {
    categories,
    totalSpending,
  }
}

/**
 * 3. Spending Pattern Detection (Deterministic Rules)
 */
export const detectSpendingPatterns = (transactions, period, budgets = {}, subscriptions = []) => {
  const periodExpenses = transactions.filter(
    (tx) =>
      tx.type === 'expense' &&
      tx.date >= period.startDate &&
      tx.date <= period.endDate
  )

  const totalSpending = periodExpenses.reduce((sum, tx) => sum + tx.amount, 0)
  const patterns = []

  if (periodExpenses.length === 0) {
    return patterns
  }

  // Rule 1: Frequent Small Purchases (micro-transactions under ₹2,000)
  const smallPurchases = periodExpenses.filter((tx) => tx.amount <= 2000)
  if (smallPurchases.length >= 3) {
    const smallTotal = smallPurchases.reduce((sum, tx) => sum + tx.amount, 0)
    const smallShare = totalSpending > 0 ? Math.round((smallTotal / totalSpending) * 100) : 0

    patterns.push({
      id: 'pattern-small-purchases',
      title: 'Frequent Micro-Transactions Accumulation',
      category: 'Discretionary Outflows',
      severity: smallShare > 20 ? 'High' : 'Medium',
      supportingData: `${smallPurchases.length} purchases under ₹2,000 totaling ${formatINR(smallTotal)} (${smallShare}% of spend)`,
      explanation:
        'Frequent everyday micro-expenses (coffee, quick dining, local transit) accumulate rapidly and represent a substantial portion of monthly cash outflow.',
      suggestedAction:
        'Establish a weekly cash allowance or dedicated micro-budget envelope to cap spontaneous daily taps.',
    })
  }

  // Rule 2: Large Individual Expenses (> 25% of monthly total or > ₹15,000)
  const largeExpenses = periodExpenses.filter(
    (tx) => tx.amount >= 15000 || (totalSpending > 0 && tx.amount / totalSpending >= 0.25)
  )

  if (largeExpenses.length > 0) {
    patterns.push({
      id: 'pattern-large-expenses',
      title: 'High-Impact Anchor Expenses',
      category: largeExpenses[0].category,
      severity: 'Info',
      supportingData: `${largeExpenses.length} major transactions (e.g. ${largeExpenses[0].description}: ${formatINR(largeExpenses[0].amount)})`,
      explanation:
        'A small number of fixed commitments (such as apartment rent or tuition) form the bedrock of your monthly burn rate.',
      suggestedAction:
        'Lock in fixed payment dates immediately following salary deposits to prevent cash flow timing friction.',
    })
  }

  // Rule 3: Repeated Transactions in Same Category
  const categoryFreq = {}
  periodExpenses.forEach((tx) => {
    categoryFreq[tx.category] = (categoryFreq[tx.category] || 0) + 1
  })

  const repeatedCategories = Object.keys(categoryFreq).filter((cat) => categoryFreq[cat] >= 2)
  if (repeatedCategories.length > 0) {
    const topRepeated = repeatedCategories[0]
    patterns.push({
      id: 'pattern-repeated-category',
      title: `High Transaction Velocity in ${topRepeated}`,
      category: topRepeated,
      severity: 'Medium',
      supportingData: `${categoryFreq[topRepeated]} separate expenses recorded in ${topRepeated}`,
      explanation:
        `You frequently interact with vendors in the ${topRepeated} category throughout the cycle. Regular repetitive swipes make monthly forecasting harder if not tracked.`,
      suggestedAction:
        `Group ${topRepeated} errands into weekly scheduled batches to unlock bulk grocery or transit savings.`,
    })
  }

  // Rule 4: Elevated Discretionary Spending Ratio (Food + Shopping + Entertainment > 30%)
  const discretionarySum = periodExpenses
    .filter((tx) => ['Food', 'Shopping', 'Entertainment'].includes(tx.category))
    .reduce((sum, tx) => sum + tx.amount, 0)

  const discretionaryPct = totalSpending > 0 ? Math.round((discretionarySum / totalSpending) * 100) : 0

  if (discretionaryPct >= 25) {
    patterns.push({
      id: 'pattern-discretionary-ratio',
      title: 'Elevated Discretionary Spending Ratio',
      category: 'Lifestyle & Leisure',
      severity: discretionaryPct > 40 ? 'High' : 'Medium',
      supportingData: `${formatINR(discretionarySum)} spent on Food, Shopping & Entertainment (${discretionaryPct}% of total)`,
      explanation:
        `Discretionary lifestyle categories represent ${discretionaryPct}% of your entire monthly outlay. While lifestyle spending brings joy, keeping it under 30% accelerates wealth goals.`,
      suggestedAction:
        'Apply the 48-hour rule for non-essential online shopping purchases above ₹2,000.',
    })
  }

  // Rule 5: Active Recurring Subscription Commitment
  const activeSubs = subscriptions.filter((s) => s.status === 'Active')
  if (activeSubs.length >= 3) {
    patterns.push({
      id: 'pattern-subscriptions',
      title: 'Multiple Concurrent SaaS & Media Passes',
      category: 'Subscriptions',
      severity: 'Low',
      supportingData: `${activeSubs.length} active recurring plans totaling scheduled payments`,
      explanation:
        'You have several recurring memberships that silently charge each billing cycle regardless of active usage.',
      suggestedAction:
        'Perform a quarterly subscription audit in the Subscription Manager to pause unused licenses.',
    })
  }

  // Rule 6: Spending Concentration in Top Category
  const catSums = {}
  periodExpenses.forEach((tx) => {
    catSums[tx.category] = (catSums[tx.category] || 0) + tx.amount
  })
  const sortedCatEntries = Object.entries(catSums).sort((a, b) => b[1] - a[1])
  if (sortedCatEntries.length > 0) {
    const [topCat, topVal] = sortedCatEntries[0]
    const topShare = totalSpending > 0 ? Math.round((topVal / totalSpending) * 100) : 0

    if (topShare >= 35) {
      patterns.push({
        id: 'pattern-concentration',
        title: `Heavy Spending Concentration in ${topCat}`,
        category: topCat,
        severity: 'Medium',
        supportingData: `${topCat} accounts for ${topShare}% of all period expenses (${formatINR(topVal)})`,
        explanation:
          `More than one-third of your budget is absorbed by ${topCat}. While often unavoidable for housing, it leaves less flexibility for unexpected costs.`,
        suggestedAction:
          'Ensure your Emergency Reserve Fund has at least 3 months of this category pre-funded.',
      })
    }
  }

  return patterns
}

/**
 * 4. Unusual Spending Detection (Transparent Rule-Based Anomaly Engine)
 */
export const detectUnusualSpending = (transactions, period) => {
  const periodExpenses = transactions.filter(
    (tx) =>
      tx.type === 'expense' &&
      tx.date >= period.startDate &&
      tx.date <= period.endDate
  )

  const detections = []

  // Check if historical ledger has sufficient depth
  if (periodExpenses.length < 3) {
    return {
      detections: [],
      hasSufficientData: false,
      message: 'Insufficient historical data to establish a reliable spending baseline.',
    }
  }

  // Calculate mean and standard statistics across period expenses
  const amounts = periodExpenses.map((t) => t.amount)
  const meanAmount = Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length)

  // Rule A: Expense significantly above the average transaction (> 2.5x mean)
  periodExpenses.forEach((tx) => {
    if (tx.amount >= meanAmount * 2.5 && tx.amount > 5000) {
      detections.push({
        id: `unusual-${tx.id}`,
        target: tx.description,
        category: tx.category,
        actualAmount: tx.amount,
        baseline: `Average transaction of ${formatINR(meanAmount)}`,
        rule: `Expense is ${(tx.amount / meanAmount).toFixed(1)}x above the cycle mean transaction amount`,
        severity: tx.amount >= meanAmount * 4 ? 'Alert' : 'Notice',
        suggestedAction:
          'Confirm this was a planned milestone expense or verify vendor statement details.',
      })
    }
  })

  // Rule B: Multiple large expenses within a short 48-hour window
  const sortedByDate = [...periodExpenses].sort((a, b) => a.date.localeCompare(b.date))
  for (let i = 0; i < sortedByDate.length - 1; i++) {
    const cur = sortedByDate[i]
    const next = sortedByDate[i + 1]
    const d1 = new Date(cur.date)
    const d2 = new Date(next.date)
    const diffDays = Math.abs(Math.round((d2 - d1) / (1000 * 60 * 60 * 24)))

    if (diffDays <= 2 && cur.amount >= 3000 && next.amount >= 3000 && cur.id !== next.id) {
      const existing = detections.find((d) => d.id === `cluster-${cur.id}-${next.id}`)
      if (!existing) {
        detections.push({
          id: `cluster-${cur.id}-${next.id}`,
          target: `${cur.description} & ${next.description}`,
          category: `${cur.category} / ${next.category}`,
          actualAmount: cur.amount + next.amount,
          baseline: `Multiple major outlays clustered within ${diffDays === 0 ? 'same day' : `${diffDays} days`}`,
          rule: 'Rapid consecutive high-value transactions within 48 hours',
          severity: 'Warning',
          suggestedAction:
            'Check upcoming bank account balance to ensure adequate liquidity for scheduled EMIs.',
        })
      }
    }
  }

  return {
    detections,
    hasSufficientData: true,
    meanTransaction: meanAmount,
  }
}

/**
 * 5. Month-over-Month Comparison Engine
 */
export const calculateMonthOverMonthComparison = (transactions, currentPeriod, allPeriods) => {
  const currentIndex = allPeriods.findIndex((p) => p.id === currentPeriod.id)
  const previousPeriod = allPeriods[currentIndex + 1] || null

  if (!previousPeriod) {
    return {
      hasComparison: false,
      message: 'No preceding cycle data available for Month-over-Month comparison.',
    }
  }

  const currentTxs = transactions.filter(
    (tx) =>
      tx.type === 'expense' &&
      tx.date >= currentPeriod.startDate &&
      tx.date <= currentPeriod.endDate
  )

  const prevTxs = transactions.filter(
    (tx) =>
      tx.type === 'expense' &&
      tx.date >= previousPeriod.startDate &&
      tx.date <= previousPeriod.endDate
  )

  if (prevTxs.length === 0) {
    return {
      hasComparison: false,
      message: `No recorded expenses found for ${previousPeriod.label} to establish comparison.`,
    }
  }

  const currentTotal = currentTxs.reduce((sum, tx) => sum + tx.amount, 0)
  const prevTotal = prevTxs.reduce((sum, tx) => sum + tx.amount, 0)
  const absoluteDiff = currentTotal - prevTotal
  const percentChange = prevTotal > 0 ? Math.round((absoluteDiff / prevTotal) * 100) : 0

  // Category-by-category breakdown
  const currentCatTotals = {}
  currentTxs.forEach((tx) => {
    currentCatTotals[tx.category] = (currentCatTotals[tx.category] || 0) + tx.amount
  })

  const prevCatTotals = {}
  prevTxs.forEach((tx) => {
    prevCatTotals[tx.category] = (prevCatTotals[tx.category] || 0) + tx.amount
  })

  const allCategories = Array.from(
    new Set([...Object.keys(currentCatTotals), ...Object.keys(prevCatTotals)])
  )

  const categoryVariances = allCategories.map((cat) => {
    const cVal = currentCatTotals[cat] || 0
    const pVal = prevCatTotals[cat] || 0
    const diff = cVal - pVal
    const pct = pVal > 0 ? Math.round((diff / pVal) * 100) : cVal > 0 ? 100 : 0

    return {
      category: cat,
      current: cVal,
      previous: pVal,
      diff,
      percentChange: pct,
      direction: diff > 0 ? 'increased' : diff < 0 ? 'decreased' : 'unchanged',
    }
  })

  // Sort by highest absolute difference
  categoryVariances.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))

  const increasedCategories = categoryVariances.filter((c) => c.diff > 0)
  const decreasedCategories = categoryVariances.filter((c) => c.diff < 0)

  return {
    hasComparison: true,
    currentPeriod,
    previousPeriod,
    currentTotal,
    prevTotal,
    absoluteDiff,
    percentChange,
    categoryVariances,
    increasedCategories,
    decreasedCategories,
  }
}

/**
 * 6. Live AI Spending Analysis via Backend OpenRouter Integration
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const fetchAISpendingAnalysis = async (spendingSummary) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/analyze-spending`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ spendingSummary }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      const errorMsg = data?.error || `Server responded with HTTP ${response.status}`
      throw new Error(errorMsg)
    }

    return {
      success: true,
      analysis: data.analysis,
      model: data.model || 'OpenRouter Model',
      timestamp: data.timestamp || new Date().toISOString(),
    }
  } catch (error) {
    console.error('[AI Spending Analysis Service Error]:', error)
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error(
        'Unable to reach SpendWise AI backend. Please ensure the backend server is running.'
      )
    }
    throw error
  }
}
