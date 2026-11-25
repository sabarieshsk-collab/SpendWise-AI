import React, { useState } from 'react'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import SummaryCards from '../components/dashboard/SummaryCards'
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart'
import CategorySpendingChart from '../components/dashboard/CategorySpendingChart'
import AIInsightWidget from '../components/dashboard/AIInsightWidget'
import BudgetProgressWidget from '../components/dashboard/BudgetProgressWidget'
import RecentTransactionsTable from '../components/dashboard/RecentTransactionsTable'
import UpcomingBillsWidget from '../components/dashboard/UpcomingBillsWidget'
import AddTransactionModal from '../components/dashboard/AddTransactionModal'
import { Info, Sparkles } from 'lucide-react'
import { useFinance } from '../context'

// Monthly historical baseline dataset for interactive month selector demonstration
const MONTHLY_DATASETS = {
  nov: {
    label: 'November 2026',
    period: 'Current Month',
    balance: '₹2,48,500',
    income: '₹1,20,000',
    expenses: '₹48,250',
    savings: '₹71,750',
    loans: '₹4,85,000',
    subscriptions: '₹12,450',
  },
  oct: {
    label: 'October 2026',
    period: 'Past Cycle',
    balance: '₹2,17,300',
    income: '₹1,12,000',
    expenses: '₹52,000',
    savings: '₹60,000',
    loans: '₹4,98,000',
    subscriptions: '₹12,450',
  },
  sep: {
    label: 'September 2026',
    period: 'Past Cycle',
    balance: '₹1,85,400',
    income: '₹1,05,000',
    expenses: '₹48,000',
    savings: '₹57,000',
    loans: '₹5,10,000',
    subscriptions: '₹11,800',
  },
  aug: {
    label: 'August 2026',
    period: 'Past Cycle',
    balance: '₹1,52,000',
    income: '₹98,000',
    expenses: '₹51,000',
    savings: '₹47,000',
    loans: '₹5,22,000',
    subscriptions: '₹11,800',
  },
  jul: {
    label: 'July 2026',
    period: 'Past Cycle',
    balance: '₹1,28,000',
    income: '₹92,000',
    expenses: '₹45,000',
    savings: '₹47,000',
    loans: '₹5,34,000',
    subscriptions: '₹11,200',
  },
  jun: {
    label: 'June 2026',
    period: 'Past Cycle',
    balance: '₹1,06,000',
    income: '₹85,000',
    expenses: '₹42,000',
    savings: '₹43,000',
    loans: '₹5,46,000',
    subscriptions: '₹11,200',
  },
}

const AVAILABLE_MONTHS = [
  { id: 'nov', label: 'November 2026', period: 'Current' },
  { id: 'oct', label: 'October 2026', period: 'Past' },
  { id: 'sep', label: 'September 2026', period: 'Past' },
  { id: 'aug', label: 'August 2026', period: 'Past' },
  { id: 'jul', label: 'July 2026', period: 'Past' },
  { id: 'jun', label: 'June 2026', period: 'Past' },
]

export const Dashboard = () => {
  const { transactions, metrics, addTransaction } = useFinance()
  const [selectedMonth, setSelectedMonth] = useState('nov')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Use dynamic shared metrics for current month, or historical dataset when exploring past months
  const currentSummary =
    selectedMonth === 'nov'
      ? {
          ...MONTHLY_DATASETS.nov,
          income: `₹${metrics.periodIncome.toLocaleString('en-IN')}`,
          expenses: `₹${metrics.periodExpenses.toLocaleString('en-IN')}`,
          savings: `₹${(metrics.periodIncome - metrics.periodExpenses).toLocaleString('en-IN')}`,
        }
      : MONTHLY_DATASETS[selectedMonth] || MONTHLY_DATASETS.nov

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      {/* 1. Header with Month Selector and Quick Add Action */}
      <DashboardHeader
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        availableMonths={AVAILABLE_MONTHS}
        onAddTransaction={() => setIsAddModalOpen(true)}
      />

      {/* 2. Six Core Financial Summary Cards */}
      <SummaryCards data={currentSummary} />

      {/* 3. Primary Charts Row: Income vs Expenses & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <IncomeExpenseChart />
        </div>
        <div className="lg:col-span-4">
          <CategorySpendingChart />
        </div>
      </div>

      {/* 4. Secondary Row: AI Co-Pilot Intelligence & Budget Envelopes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <AIInsightWidget />
        </div>
        <div className="lg:col-span-6">
          <BudgetProgressWidget />
        </div>
      </div>

      {/* 5. Tertiary Row: Recent Transactions Table & Upcoming Commitments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <RecentTransactionsTable transactions={transactions} />
        </div>
        <div className="lg:col-span-4">
          <UpcomingBillsWidget />
        </div>
      </div>

      {/* Demonstration Notice Footer */}
      <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-3 text-xs text-text-secondary">
        <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-left">
          <p className="font-semibold text-text-primary">
            Demonstration Mode Active
          </p>
          <p className="leading-relaxed">
            All balances, income statements, credit cards, loan figures, and transaction logs displayed are illustrative demonstration data. Real multi-account synchronization and database persistence will be integrated during backend development.
          </p>
        </div>
      </div>

      {/* Interactive Quick Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addTransaction}
      />
    </div>
  )
}

export default Dashboard
