import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  ArrowRight,
  CreditCard,
} from 'lucide-react'

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    description: 'TechCorp Solutions Ltd.',
    category: 'Salary & Earnings',
    type: 'income',
    amount: 120000,
    date: 'Nov 01, 2026',
    account: 'HDFC Priority A/c',
  },
  {
    id: 'tx-2',
    description: 'Nature Fresh Organic Mart',
    category: 'Groceries & Household',
    type: 'expense',
    amount: 3450,
    date: 'Today, 2:15 PM',
    account: 'Credit Card •••• 4291',
  },
  {
    id: 'tx-3',
    description: 'Bistro Verde Dining',
    category: 'Food & Dining',
    type: 'expense',
    amount: 1850,
    date: 'Yesterday, 8:40 PM',
    account: 'UPI - GPay',
  },
  {
    id: 'tx-4',
    description: 'Cloud Workspace & AI Suite',
    category: 'Subscription',
    type: 'expense',
    amount: 1499,
    date: 'Nov 12, 2026',
    account: 'Credit Card •••• 4291',
  },
  {
    id: 'tx-5',
    description: 'Freelance Design Retainer',
    category: 'Consulting',
    type: 'income',
    amount: 25000,
    date: 'Nov 10, 2026',
    account: 'ICICI Bank A/c',
  },
  {
    id: 'tx-6',
    description: 'Metropolitan Electricity Board',
    category: 'Utilities & Bills',
    type: 'expense',
    amount: 2840,
    date: 'Nov 08, 2026',
    account: 'Net Banking',
  },
]

export const RecentTransactionsTable = ({ transactions = INITIAL_TRANSACTIONS }) => {
  const [filterType, setFilterType] = useState('all') // 'all' | 'income' | 'expense'
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = transactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-card space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
            Recent Transactions
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time feed of expenditures, deposits, and automated settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Filter Pills */}
          <div className="p-0.5 rounded-lg bg-background border border-border flex items-center text-xs">
            {['all', 'income', 'expense'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                  filterType === t
                    ? 'bg-card text-text-primary font-semibold shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Link
            to="/transactions"
            className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by description or category..."
          className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-border/60">
        {filtered.length > 0 ? (
          filtered.map((tx) => (
            <div
              key={tx.id}
              className="py-3 flex items-center justify-between gap-3 hover:bg-white/5 px-2 rounded-xl transition-colors"
            >
              {/* Left: Icon & Description */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    tx.type === 'income'
                      ? 'bg-success/15 text-success border-success/30'
                      : 'bg-card border-border text-text-secondary'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">
                    {tx.description}
                  </p>
                  <p className="text-[10px] text-text-muted flex items-center gap-1.5 mt-0.5">
                    <span>{tx.date}</span>
                    <span>•</span>
                    <span className="truncate">{tx.account}</span>
                  </p>
                </div>
              </div>

              {/* Right: Category badge & Amount */}
              <div className="text-right shrink-0 flex items-center gap-3">
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-background border border-border text-text-secondary">
                  {tx.category}
                </span>

                <div>
                  <span
                    className={`text-xs sm:text-sm font-bold block ${
                      tx.type === 'income' ? 'text-success' : 'text-text-primary'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] text-text-muted capitalize block">
                    {tx.type}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-xs text-text-muted">
            No transactions matching "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentTransactionsTable
