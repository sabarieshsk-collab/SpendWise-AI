import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import { getFinance, updateFinance } from '../services/financeService'

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Education',
  'Healthcare',
  'Housing',
  'Utilities',
  'Subscriptions',
  'Travel',
  'Other',
]

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelancing',
  'Allowance',
  'Business Income',
  'Investments',
  'Other',
]

export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
]

export const SAVINGS_CATEGORIES = [
  'Emergency Fund',
  'Education',
  'Travel',
  'New Vehicle',
  'Electronics',
  'Home Purchase',
  'Other',
]

export const LOAN_TYPES = [
  'Home Loan',
  'Personal Loan',
  'Education Loan',
  'Vehicle Loan',
  'Business Loan',
  'Other',
]

export const SUBSCRIPTION_CATEGORIES = [
  'Entertainment',
  'Software',
  'Productivity',
  'Cloud Storage',
  'Education',
  'Fitness',
  'Other',
]

export const SUBSCRIPTION_FREQUENCIES = [
  'Weekly',
  'Monthly',
  'Quarterly',
  'Half-yearly',
  'Yearly',
]

export const BUDGET_PERIODS = [
  { id: '2026-11', label: 'November 2026', startDate: '2026-11-01', endDate: '2026-11-30', isCurrent: true },
  { id: '2026-10', label: 'October 2026', startDate: '2026-10-01', endDate: '2026-10-31', isCurrent: false },
  { id: '2026-09', label: 'September 2026', startDate: '2026-09-01', endDate: '2026-09-30', isCurrent: false },
  { id: '2026-08', label: 'August 2026', startDate: '2026-08-01', endDate: '2026-08-31', isCurrent: false },
]

// Monthly equivalent cost calculator for recurring subscriptions
export const calculateMonthlyEquivalent = (amount, frequency) => {
  const val = parseFloat(amount) || 0
  switch (frequency?.toLowerCase()) {
    case 'weekly':
      return Math.round((val * 52) / 12)
    case 'monthly':
      return Math.round(val)
    case 'quarterly':
      return Math.round(val / 3)
    case 'half-yearly':
      return Math.round(val / 6)
    case 'yearly':
      return Math.round(val / 12)
    default:
      return Math.round(val)
  }
}

// Standard Reducing-Balance EMI Formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
export const calculateReducingBalanceEMI = (principal, annualRate, tenureMonths) => {
  const P = parseFloat(principal) || 0
  const n = parseInt(tenureMonths, 10) || 0
  const annualR = parseFloat(annualRate) || 0
  if (P <= 0 || n <= 0) return 0
  if (annualR <= 0) return Math.round(P / n) // zero-interest loan
  const r = annualR / (12 * 100)
  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  return Math.round(emi)
}

// Advances a YYYY-MM-DD date by exactly one calendar month, clamping to the last valid day of the month
export const advanceDateByOneMonth = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }
  const [y, m, d] = dateStr.split('-').map(Number)
  const nextY = m === 12 ? y + 1 : y
  const nextM = m === 12 ? 1 : m + 1
  const maxDays = new Date(nextY, nextM, 0).getDate()
  const nextD = Math.min(d, maxDays)
  return `${nextY}-${String(nextM).padStart(2, '0')}-${String(nextD).padStart(2, '0')}`
}

// Initial demonstration transactions
const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    description: 'TechCorp Solutions Salary',
    category: 'Salary',
    type: 'income',
    amount: 120000,
    date: '2026-11-01',
    paymentMethod: 'Bank Transfer',
    notes: 'Monthly regular compensation',
  },
  {
    id: 'tx-2',
    description: 'Apartment Monthly Rent',
    category: 'Housing',
    type: 'expense',
    amount: 18000,
    date: '2026-11-02',
    paymentMethod: 'Bank Transfer',
    notes: 'Flat 402 lease agreement',
  },
  {
    id: 'tx-3',
    description: 'Gourmet Bistro & Cafe',
    category: 'Food',
    type: 'expense',
    amount: 2450,
    date: '2026-11-04',
    paymentMethod: 'UPI',
    notes: 'Team dinner outing',
  },
  {
    id: 'tx-4',
    description: 'Freelance UI/UX Consulting',
    category: 'Freelancing',
    type: 'income',
    amount: 25000,
    date: '2026-11-05',
    paymentMethod: 'Bank Transfer',
    notes: 'Fintech dashboard sprint milestone',
  },
  {
    id: 'tx-5',
    description: 'Supermarket Organic Groceries',
    category: 'Shopping',
    type: 'expense',
    amount: 4100,
    date: '2026-11-07',
    paymentMethod: 'Credit Card',
    notes: 'Weekly household supplies',
  },
  {
    id: 'tx-6',
    description: 'City Power & Grid Board',
    category: 'Utilities',
    type: 'expense',
    amount: 4800,
    date: '2026-11-08',
    paymentMethod: 'UPI',
    notes: 'Electricity billing statement',
  },
  {
    id: 'tx-7',
    description: 'Metro Transit Card Recharge',
    category: 'Transportation',
    type: 'expense',
    amount: 1500,
    date: '2026-11-10',
    paymentMethod: 'Debit Card',
    notes: 'Monthly commute pass',
  },
  {
    id: 'tx-8',
    description: 'Cloud Workspace & AI Tools',
    category: 'Subscriptions',
    type: 'expense',
    amount: 1499,
    date: '2026-11-12',
    paymentMethod: 'Credit Card',
    notes: 'Monthly recurring developer seat',
  },
  {
    id: 'tx-9',
    description: 'Fine Dining Weekend Dinner',
    category: 'Food',
    type: 'expense',
    amount: 3200,
    date: '2026-11-14',
    paymentMethod: 'Credit Card',
    notes: 'Family celebratory dinner',
  },
  {
    id: 'tx-10',
    description: 'Cinema IMAX Tickets & Snacks',
    category: 'Entertainment',
    type: 'expense',
    amount: 1850,
    date: '2026-11-15',
    paymentMethod: 'UPI',
    notes: 'Weekend movie with friends',
  },
  {
    id: 'tx-11',
    description: 'Mutual Fund Dividend Payout',
    category: 'Investments',
    type: 'income',
    amount: 4500,
    date: '2026-11-16',
    paymentMethod: 'Bank Transfer',
    notes: 'Q3 index growth portfolio',
  },
  {
    id: 'tx-12',
    description: 'Pharmacy & Wellness Vitamins',
    category: 'Healthcare',
    type: 'expense',
    amount: 1250,
    date: '2026-11-17',
    paymentMethod: 'UPI',
    notes: 'Monthly wellness replenishment',
  },
  // October 2026 Historical Demonstration Ledger
  {
    id: 'tx-oct-1',
    description: 'TechCorp Solutions Salary',
    category: 'Salary',
    type: 'income',
    amount: 115000,
    date: '2026-10-01',
    paymentMethod: 'Bank Transfer',
    notes: 'October monthly salary',
  },
  {
    id: 'tx-oct-2',
    description: 'Apartment Monthly Rent',
    category: 'Housing',
    type: 'expense',
    amount: 18000,
    date: '2026-10-02',
    paymentMethod: 'Bank Transfer',
    notes: 'October lease payment',
  },
  {
    id: 'tx-oct-3',
    description: 'Supermarket Supplies',
    category: 'Shopping',
    type: 'expense',
    amount: 5200,
    date: '2026-10-06',
    paymentMethod: 'Credit Card',
    notes: 'Monthly household stock-up',
  },
  {
    id: 'tx-oct-4',
    description: 'Family Dining & Takeaway',
    category: 'Food',
    type: 'expense',
    amount: 4800,
    date: '2026-10-12',
    paymentMethod: 'UPI',
    notes: 'Weekend dinners',
  },
  {
    id: 'tx-oct-5',
    description: 'Electric & Utility Bill',
    category: 'Utilities',
    type: 'expense',
    amount: 4500,
    date: '2026-10-18',
    paymentMethod: 'UPI',
    notes: 'October power consumption',
  },
  {
    id: 'tx-oct-6',
    description: 'Flight Booking Autumn Trip',
    category: 'Travel',
    type: 'expense',
    amount: 8500,
    date: '2026-10-22',
    paymentMethod: 'Credit Card',
    notes: 'Weekend mountain getaway',
  },
  {
    id: 'tx-oct-7',
    description: 'Commute & Fuel Refill',
    category: 'Transportation',
    type: 'expense',
    amount: 2100,
    date: '2026-10-25',
    paymentMethod: 'Debit Card',
    notes: 'Transit & fuel refills',
  },
  {
    id: 'tx-oct-8',
    description: 'Cloud Workspace & AI Tools',
    category: 'Subscriptions',
    type: 'expense',
    amount: 1499,
    date: '2026-10-28',
    paymentMethod: 'Credit Card',
    notes: 'Monthly developer pass',
  },
]

// Initial demonstration category budgets
const INITIAL_BUDGETS = {
  Food: { limit: 14000 },
  Housing: { limit: 20000 },
  Shopping: { limit: 8000 },
  Transportation: { limit: 5000 },
  Utilities: { limit: 6000 },
  Subscriptions: { limit: 3500 },
  Entertainment: { limit: 4000 },
  Healthcare: { limit: 5000 },
  Education: { limit: 6000 },
  Travel: { limit: 10000 },
  Other: { limit: 3000 },
}

// Initial demonstration savings goals
const INITIAL_SAVINGS_GOALS = [
  {
    id: 'goal-1',
    name: 'Emergency Reserve Fund',
    category: 'Emergency Fund',
    targetAmount: 250000,
    savedAmount: 180000,
    targetDate: '2026-12-31',
    description: '6 months of essential living expenses kept in high-yield liquid pot.',
    contributions: [
      { id: 'c-1', amount: 25000, date: '2026-09-01', note: 'Initial allocation' },
      { id: 'c-2', amount: 50000, date: '2026-10-01', note: 'Bonus transfer' },
      { id: 'c-3', amount: 105000, date: '2026-11-01', note: 'Monthly savings surplus' },
    ],
  },
  {
    id: 'goal-2',
    name: 'Annual Vacation to Europe',
    category: 'Travel',
    targetAmount: 60000,
    savedAmount: 45000,
    targetDate: '2027-04-15',
    description: 'Flights, accommodations, and itinerary experiences for spring holiday.',
    contributions: [
      { id: 'c-4', amount: 20000, date: '2026-10-15', note: 'Flight seed fund' },
      { id: 'c-5', amount: 25000, date: '2026-11-10', note: 'Festival bonus allocation' },
    ],
  },
  {
    id: 'goal-3',
    name: 'EV Vehicle Down Payment',
    category: 'New Vehicle',
    targetAmount: 300000,
    savedAmount: 120000,
    targetDate: '2027-08-30',
    description: 'Target down payment for an electric car to minimize auto loan interest.',
    contributions: [
      { id: 'c-6', amount: 60000, date: '2026-08-15', note: 'Initial vehicle fund' },
      { id: 'c-7', amount: 60000, date: '2026-11-05', note: 'Quarterly deposit' },
    ],
  },
  {
    id: 'goal-4',
    name: 'Next-Gen Developer Rig',
    category: 'Electronics',
    targetAmount: 150000,
    savedAmount: 90000,
    targetDate: '2027-01-20',
    description: 'Workstation upgrade for AI local model development and design.',
    contributions: [
      { id: 'c-8', amount: 45000, date: '2026-09-20', note: 'Hardware reserve' },
      { id: 'c-9', amount: 45000, date: '2026-11-14', note: 'Freelance project surplus' },
    ],
  },
]

// Initial demonstration loans
const INITIAL_LOANS = [
  {
    id: 'loan-1',
    name: 'Home Purchase Loan',
    loanType: 'Home Loan',
    lender: 'HDFC Housing Finance',
    principal: 400000,
    balance: 345000,
    interestRate: 8.5,
    startDate: '2024-01-10',
    tenureMonths: 60,
    emi: 8209,
    nextDueDate: '2026-11-23',
    repayments: [
      { id: 'r-1', amount: 8209, date: '2026-09-23', method: 'Bank Transfer', notes: 'Monthly EMI' },
      { id: 'r-2', amount: 8209, date: '2026-10-23', method: 'Bank Transfer', notes: 'Monthly EMI' },
    ],
  },
  {
    id: 'loan-2',
    name: 'Automobile Purchase Loan',
    loanType: 'Vehicle Loan',
    lender: 'ICICI Auto Bank',
    principal: 150000,
    balance: 140000,
    interestRate: 9.0,
    startDate: '2025-05-15',
    tenureMonths: 36,
    emi: 4770,
    nextDueDate: '2026-11-30',
    repayments: [
      { id: 'r-3', amount: 4770, date: '2026-10-15', method: 'UPI', notes: 'Monthly EMI installment' },
    ],
  },
]

// Initial demonstration subscriptions
const INITIAL_SUBSCRIPTIONS = [
  {
    id: 'sub-1',
    name: 'Cloud Workspace Suite',
    provider: 'Google Cloud Platform',
    category: 'Cloud Storage',
    amount: 1499,
    frequency: 'Monthly',
    paymentMethod: 'Credit Card',
    startDate: '2025-01-15',
    nextRenewalDate: '2026-11-25',
    expiryDate: '2027-11-25',
    autoRenewal: true,
    status: 'Active',
  },
  {
    id: 'sub-2',
    name: 'Media Streaming Pass',
    provider: 'Netflix & Spotify Hub',
    category: 'Entertainment',
    amount: 649,
    frequency: 'Monthly',
    paymentMethod: 'Credit Card',
    startDate: '2024-06-10',
    nextRenewalDate: '2026-11-28',
    expiryDate: '2027-05-28',
    autoRenewal: true,
    status: 'Active',
  },
  {
    id: 'sub-3',
    name: 'AI Co-Pilot Dev API',
    provider: 'OpenAI Technologies',
    category: 'Productivity',
    amount: 1650,
    frequency: 'Monthly',
    paymentMethod: 'Credit Card',
    startDate: '2025-03-01',
    nextRenewalDate: '2026-12-05',
    expiryDate: '2027-12-05',
    autoRenewal: true,
    status: 'Active',
  },
  {
    id: 'sub-4',
    name: 'Gym & Crossfit Annual Pass',
    provider: 'Cult.fit Fitness Center',
    category: 'Fitness',
    amount: 14400,
    frequency: 'Yearly',
    paymentMethod: 'UPI',
    startDate: '2026-03-15',
    nextRenewalDate: '2027-03-15',
    expiryDate: '2027-03-15',
    autoRenewal: false,
    status: 'Active',
  },
  {
    id: 'sub-5',
    name: 'Tech Journal Dispatch',
    provider: 'The Morning Dispatch',
    category: 'Education',
    amount: 300,
    frequency: 'Monthly',
    paymentMethod: 'UPI',
    startDate: '2025-08-01',
    nextRenewalDate: '2026-11-30',
    expiryDate: '2027-01-30',
    autoRenewal: false,
    status: 'Paused',
  },
]

const FinanceContext = createContext(null)

export const FinanceProvider = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth()
  const [financeLoading, setFinanceLoading] = useState(true)
  const [loadedUserId, setLoadedUserId] = useState(null)
  const activeUserIdRef = useRef(user?.id || null)

  const [transactions, setTransactions] = useState(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`spendwise_finance_${user.id}`)
      if (saved) {
        try {
          return JSON.parse(saved).transactions || []
        } catch (e) { }
      }
      return []
    }
    return INITIAL_TRANSACTIONS
  })
  const [budgets, setBudgets] = useState(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`spendwise_finance_${user.id}`)
      if (saved) {
        try {
          return JSON.parse(saved).budgets || INITIAL_BUDGETS
        } catch (e) { }
      }
      return INITIAL_BUDGETS
    }
    return INITIAL_BUDGETS
  })
  const [savingsGoals, setSavingsGoals] = useState(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`spendwise_finance_${user.id}`)
      if (saved) {
        try {
          return JSON.parse(saved).savingsGoals || []
        } catch (e) { }
      }
      return []
    }
    return INITIAL_SAVINGS_GOALS
  })
  const [loans, setLoans] = useState(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`spendwise_finance_${user.id}`)
      if (saved) {
        try {
          return JSON.parse(saved).loans || []
        } catch (e) { }
      }
      return []
    }
    return INITIAL_LOANS
  })
  const [subscriptions, setSubscriptions] = useState(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`spendwise_finance_${user.id}`)
      if (saved) {
        try {
          return JSON.parse(saved).subscriptions || []
        } catch (e) { }
      }
      return []
    }
    return INITIAL_SUBSCRIPTIONS
  })
  const [selectedPeriodId, setSelectedPeriodId] = useState('2026-11')
  const [toast, setToast] = useState(null)

  // Switch ledger state whenever active user changes

  // Load financial data for the authenticated user
  useEffect(() => {
    let cancelled = false

    const loadFinance = async () => {
      if (authLoading) return

      setFinanceLoading(true)
      setLoadedUserId(null)

      if (!user?.id) {
        activeUserIdRef.current = null
        setTransactions([])
        setBudgets(INITIAL_BUDGETS)
        setSavingsGoals([])
        setLoans([])
        setSubscriptions([])
        setFinanceLoading(false)
        return
      }

      const currentId = user.id
      activeUserIdRef.current = currentId

      try {
        let finance

        try {
          // Fetch financial data from MongoDB
          finance = await getFinance()
        } catch (error) {
          if (error.status !== 404) {
            throw error
          }

          // No MongoDB record: check existing localStorage data
          const saved = localStorage.getItem(
            `spendwise_finance_${currentId}`
          )

          if (saved) {
            finance = JSON.parse(saved)
          } else {
            finance = {
              transactions: [],
              budgets: INITIAL_BUDGETS,
              savingsGoals: [],
              loans: [],
              subscriptions: [],
            }
          }

          // Migrate existing data or create an empty record
          await updateFinance(finance)
        }

        if (cancelled) return

        setTransactions(finance.transactions || [])
        setBudgets(finance.budgets || INITIAL_BUDGETS)
        setSavingsGoals(finance.savingsGoals || [])
        setLoans(finance.loans || [])
        setSubscriptions(finance.subscriptions || [])

        setLoadedUserId(currentId)
      } catch (error) {
        console.error('Error loading financial data:', error)
      } finally {
        if (!cancelled) {
          setFinanceLoading(false)
        }
      }
    }

    loadFinance()

    return () => {
      cancelled = true
    }
  }, [user?.id, authLoading])



  // Persist financial data to localStorage and MongoDB
  useEffect(() => {
    // Do not save until authentication and finance loading are complete
    if (
      authLoading ||
      financeLoading ||
      !user?.id ||
      loadedUserId !== user.id
    ) {
      return
    }

    const userData = {
      transactions,
      budgets,
      savingsGoals,
      loans,
      subscriptions,
    }

    // Keep a local backup
    localStorage.setItem(
      `spendwise_finance_${user.id}`,
      JSON.stringify(userData)
    )

    // Save to MongoDB after a short delay
    const timeoutId = setTimeout(async () => {
      try {
        await updateFinance(userData)
        console.log('[SpendWise] Financial data saved to MongoDB')
      } catch (error) {
        console.error('[SpendWise] MongoDB save failed:', error)
      }
    }, 800)

    return () => clearTimeout(timeoutId)
  }, [
    user?.id,
    authLoading,
    financeLoading,
    loadedUserId,
    transactions,
    budgets,
    savingsGoals,
    loans,
    subscriptions,
  ])

  const activePeriod = useMemo(() => {
    return BUDGET_PERIODS.find((p) => p.id === selectedPeriodId) || BUDGET_PERIODS[0]
  }, [selectedPeriodId])

  // Trigger toast alert
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  // --- 1. Transaction Operations ---
  const addTransaction = (newTx) => {
    const amountNum = parseFloat(newTx.amount) || 0
    const formattedTx = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...newTx,
      amount: Math.abs(amountNum),
      type: newTx.type === 'income' ? 'income' : 'expense',
    }
    setTransactions((prev) => [formattedTx, ...prev])
    showToast(`Transaction "${formattedTx.description}" added successfully!`)
  }

  const deleteTransaction = (id) => {
    const tx = transactions.find((t) => t.id === id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    showToast(`Transaction "${tx?.description || 'Item'}" deleted.`, 'info')
  }

  const updateTransaction = (id, updatedFields) => {
    const amountNum = parseFloat(updatedFields.amount) || 0
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
            ...t,
            ...updatedFields,
            amount: Math.abs(amountNum),
            type: updatedFields.type === 'income' ? 'income' : 'expense',
          }
          : t
      )
    )
    showToast('Transaction details updated.')
  }

  // --- 2. Budget Operations ---
  const createBudget = (category, limit) => {
    if (budgets[category]) {
      showToast(`A budget for ${category} already exists. Please edit its allocation instead.`, 'danger')
      return false
    }
    const limitNum = Math.abs(parseFloat(limit) || 0)
    setBudgets((prev) => ({
      ...prev,
      [category]: { limit: limitNum },
    }))
    showToast(`Budget envelope created for ${category}: ₹${limitNum.toLocaleString('en-IN')}`)
    return true
  }

  const updateBudget = (category, limit) => {
    const limitNum = Math.abs(parseFloat(limit) || 0)
    setBudgets((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        limit: limitNum,
      },
    }))
    showToast(`Budget for ${category} updated to ₹${limitNum.toLocaleString('en-IN')}`)
  }

  const deleteBudget = (category) => {
    setBudgets((prev) => {
      const copy = { ...prev }
      delete copy[category]
      return copy
    })
    showToast(`Budget envelope for ${category} removed.`, 'info')
  }

  // --- 3. Savings Goals Operations ---
  const addSavingsGoal = (goal) => {
    const target = Math.abs(parseFloat(goal.targetAmount) || 0)
    const initial = Math.abs(parseFloat(goal.initialSavedAmount) || 0)
    const newGoal = {
      id: `goal-${Date.now()}`,
      name: goal.name.trim(),
      category: goal.category,
      targetAmount: target,
      savedAmount: Math.min(initial, target),
      targetDate: goal.targetDate,
      description: goal.description?.trim() || '',
      contributions: initial > 0 ? [{ id: `c-${Date.now()}`, amount: initial, date: new Date().toISOString().split('T')[0], note: 'Initial saved balance' }] : [],
    }
    setSavingsGoals((prev) => [newGoal, ...prev])
    showToast(`Savings goal "${newGoal.name}" created!`)
  }

  const updateSavingsGoal = (id, updated) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updated, targetAmount: parseFloat(updated.targetAmount) || g.targetAmount } : g))
    )
    showToast('Savings goal updated.')
  }

  const deleteSavingsGoal = (id) => {
    const target = savingsGoals.find((g) => g.id === id)
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id))
    showToast(`Savings goal "${target?.name || 'Item'}" removed.`, 'info')
  }

  const addSavingsContribution = (goalId, { amount, date, note }) => {
    const contributionNum = Math.abs(parseFloat(amount) || 0)
    if (contributionNum <= 0) return

    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g
        const remaining = g.targetAmount - g.savedAmount
        const actualAddition = Math.min(contributionNum, remaining)
        const updatedSaved = g.savedAmount + actualAddition
        const newContribution = {
          id: `c-${Date.now()}`,
          amount: actualAddition,
          date: date || new Date().toISOString().split('T')[0],
          note: note?.trim() || 'Manual deposit',
        }
        return {
          ...g,
          savedAmount: updatedSaved,
          contributions: [newContribution, ...(g.contributions || [])],
        }
      })
    )
    showToast(`Added contribution of ₹${contributionNum.toLocaleString('en-IN')}!`)
  }

  // --- 4. Loan Manager Operations ---
  const addLoan = (loanData) => {
    const P = Math.abs(parseFloat(loanData.principal) || 0)
    const r = Math.abs(parseFloat(loanData.interestRate) || 0)
    const n = parseInt(loanData.tenureMonths, 10) || 12
    const calculatedEMI = loanData.emi
      ? Math.abs(parseFloat(loanData.emi))
      : calculateReducingBalanceEMI(P, r, n)

    const newLoan = {
      id: `loan-${Date.now()}`,
      name: loanData.name.trim(),
      loanType: loanData.loanType,
      lender: loanData.lender.trim(),
      principal: P,
      balance: P,
      interestRate: r,
      startDate: loanData.startDate,
      tenureMonths: n,
      emi: calculatedEMI,
      nextDueDate: loanData.nextDueDate,
      repayments: [],
    }
    setLoans((prev) => [newLoan, ...prev])
    showToast(`Loan record "${newLoan.name}" created!`)
  }

  const updateLoan = (id, updated) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updated, principal: parseFloat(updated.principal) || l.principal, balance: parseFloat(updated.balance) || l.balance } : l))
    )
    showToast('Loan details updated.')
  }

  const deleteLoan = (id) => {
    const target = loans.find((l) => l.id === id)
    setLoans((prev) => prev.filter((l) => l.id !== id))
    showToast(`Loan "${target?.name || 'Item'}" removed.`, 'info')
  }

  const addLoanRepayment = (loanId, { amount, date, method, notes, paymentType = 'EMI', paidDueDate = null }) => {
    const paymentNum = Math.abs(parseFloat(amount) || 0)
    if (paymentNum <= 0) return

    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== loanId) return l
        const newBalance = Math.max(0, l.balance - paymentNum)
        const currentDueDate = l.nextDueDate || ''
        const alreadyPaidDates = Array.isArray(l.paidDueDates) ? l.paidDueDates : []

        // An EMI is settled if:
        // 1. paymentType is 'EMI'
        // 2. amount covers the EMI (or the remaining balance if less than emi)
        // 3. current nextDueDate exists and has not already been marked paid
        const isEmiPayment = paymentType === 'EMI'
        const coversEmi = paymentNum >= Math.min(l.emi, l.balance)
        const isCurrentDueUnpaid = Boolean(currentDueDate && !alreadyPaidDates.includes(currentDueDate))
        const settlesEmi = isEmiPayment && coversEmi && isCurrentDueUnpaid

        let updatedNextDueDate = currentDueDate
        let updatedPaidDueDates = [...alreadyPaidDates]
        let settledDueDate = paidDueDate || (settlesEmi ? currentDueDate : '')

        if (settlesEmi) {
          updatedPaidDueDates.push(currentDueDate)
          updatedNextDueDate = advanceDateByOneMonth(currentDueDate)
        }

        const newPayment = {
          id: `r-${Date.now()}`,
          amount: paymentNum,
          date: date || new Date().toISOString().split('T')[0],
          method: method || 'Bank Transfer',
          notes: notes?.trim() || (isEmiPayment ? 'EMI Installment' : 'Principal Repayment'),
          paymentType: isEmiPayment ? 'EMI' : (paymentType || 'PARTIAL'),
          paidDueDate: settledDueDate,
        }

        return {
          ...l,
          balance: newBalance,
          nextDueDate: updatedNextDueDate,
          paidDueDates: updatedPaidDueDates,
          lastPaidDueDate: settlesEmi ? currentDueDate : (l.lastPaidDueDate || ''),
          repayments: [newPayment, ...(l.repayments || [])],
        }
      })
    )
    showToast(`Recorded repayment of ₹${paymentNum.toLocaleString('en-IN')}!`)
  }

  // --- 5. Subscription Manager Operations ---
  const addSubscription = (subData) => {
    const newSub = {
      id: `sub-${Date.now()}`,
      name: subData.name.trim(),
      provider: subData.provider.trim(),
      category: subData.category,
      amount: Math.abs(parseFloat(subData.amount) || 0),
      frequency: subData.frequency || 'Monthly',
      paymentMethod: subData.paymentMethod || 'Credit Card',
      startDate: subData.startDate,
      nextRenewalDate: subData.nextRenewalDate,
      expiryDate: subData.expiryDate || '',
      autoRenewal: Boolean(subData.autoRenewal),
      status: subData.status || 'Active',
    }
    setSubscriptions((prev) => [newSub, ...prev])
    showToast(`Subscription "${newSub.name}" added!`)
  }

  const updateSubscription = (id, updated) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated, amount: parseFloat(updated.amount) || s.amount } : s))
    )
    showToast('Subscription updated.')
  }

  const deleteSubscription = (id) => {
    const target = subscriptions.find((s) => s.id === id)
    setSubscriptions((prev) => prev.filter((s) => s.id !== id))
    showToast(`Subscription "${target?.name || 'Item'}" deleted.`, 'info')
  }

  const toggleSubscriptionStatus = (id, nextStatus) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
    )
    showToast(`Subscription status set to ${nextStatus}.`)
  }

  // --- 6. Deterministic Metrics & Derived Values ---
  const metrics = useMemo(() => {
    // 1. Transactions & Budget metrics
    let totalIncome = 0
    let totalExpenses = 0
    let periodIncome = 0
    let periodExpenses = 0
    const categorySpending = {}
    const periodCategorySpending = {}
    const dateSpendingMap = {}

    transactions.forEach((tx) => {
      const isCurrentPeriod =
        tx.date >= activePeriod.startDate && tx.date <= activePeriod.endDate

      if (tx.type === 'income') {
        totalIncome += tx.amount
        if (isCurrentPeriod) {
          periodIncome += tx.amount
        }
      } else if (tx.type === 'expense') {
        totalExpenses += tx.amount
        categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount

        if (isCurrentPeriod) {
          periodExpenses += tx.amount
          periodCategorySpending[tx.category] =
            (periodCategorySpending[tx.category] || 0) + tx.amount
          dateSpendingMap[tx.date] = (dateSpendingMap[tx.date] || 0) + tx.amount
        }
      }
    })

    const netCashFlow = totalIncome - totalExpenses
    const periodNetCashFlow = periodIncome - periodExpenses
    const totalTransactions = transactions.length

    let totalAllocatedBudget = 0
    Object.keys(budgets).forEach((cat) => {
      totalAllocatedBudget += budgets[cat].limit || 0
    })

    const remainingBudget = totalAllocatedBudget - periodExpenses
    const overallUtilization =
      totalAllocatedBudget > 0
        ? Math.round((periodExpenses / totalAllocatedBudget) * 100)
        : 0

    // 2. Savings Goals Metrics
    let totalSavingsTarget = 0
    let totalAmountSaved = 0
    savingsGoals.forEach((g) => {
      totalSavingsTarget += g.targetAmount
      totalAmountSaved += g.savedAmount
    })
    const remainingSavingsAmount = Math.max(0, totalSavingsTarget - totalAmountSaved)
    const overallGoalCompletionPercent =
      totalSavingsTarget > 0 ? Math.round((totalAmountSaved / totalSavingsTarget) * 100) : 0

    // 3. Loans Metrics
    let totalLoanPrincipal = 0
    let totalLoanOutstanding = 0
    let monthlyEMICommitment = 0
    let totalRepaymentsMade = 0

    loans.forEach((l) => {
      totalLoanPrincipal += l.principal
      totalLoanOutstanding += l.balance
      monthlyEMICommitment += l.balance > 0 ? l.emi : 0
      const repaidSum = (l.repayments || []).reduce((acc, r) => acc + r.amount, 0)
      totalRepaymentsMade += repaidSum
    })
    const totalAmountRepaid = totalLoanPrincipal - totalLoanOutstanding + totalRepaymentsMade

    // 4. Subscriptions Metrics (calculated strictly from ACTIVE subscriptions)
    const activeSubs = subscriptions.filter((s) => s.status === 'Active')
    let monthlyRecurringCost = 0
    activeSubs.forEach((s) => {
      monthlyRecurringCost += calculateMonthlyEquivalent(s.amount, s.frequency)
    })
    const annualizedSubscriptionCost = monthlyRecurringCost * 12
    const activeSubscriptionsCount = activeSubs.length

    return {
      totalIncome,
      totalExpenses,
      netCashFlow,
      totalTransactions,
      categorySpending,
      periodIncome,
      periodExpenses,
      periodNetCashFlow,
      periodCategorySpending,
      totalAllocatedBudget,
      remainingBudget,
      overallUtilization,
      dateSpendingMap,
      // Goals
      totalSavingsTarget,
      totalAmountSaved,
      remainingSavingsAmount,
      overallGoalCompletionPercent,
      // Loans
      totalLoanPrincipal,
      totalLoanOutstanding,
      monthlyEMICommitment,
      totalAmountRepaid,
      // Subscriptions
      activeSubscriptionsCount,
      monthlyRecurringCost,
      annualizedSubscriptionCost,
    }
  }, [transactions, budgets, savingsGoals, loans, subscriptions, activePeriod])

  const value = {
    transactions,
    budgets,
    savingsGoals,
    loans,
    subscriptions,
    activePeriod,
    selectedPeriodId,
    setSelectedPeriodId,
    toast,
    showToast,
    // Transactions
    addTransaction,
    deleteTransaction,
    updateTransaction,
    // Budgets
    createBudget,
    updateBudget,
    deleteBudget,
    // Goals
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addSavingsContribution,
    // Loans
    addLoan,
    updateLoan,
    deleteLoan,
    addLoanRepayment,
    // Subscriptions
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
    metrics,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    PAYMENT_METHODS,
    SAVINGS_CATEGORIES,
    LOAN_TYPES,
    SUBSCRIPTION_CATEGORIES,
    SUBSCRIPTION_FREQUENCIES,
    BUDGET_PERIODS,
    calculateMonthlyEquivalent,
    calculateReducingBalanceEMI,
  }

  return (
    <FinanceContext.Provider value={value}>
      {children}
      {/* Global Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md ${toast.type === 'danger'
              ? 'bg-danger/20 border-danger/40 text-danger'
              : toast.type === 'info'
                ? 'bg-secondary/20 border-primary/40 text-secondary'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              }`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}

export default FinanceContext
