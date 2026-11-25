import React from 'react'
import { Link } from 'react-router-dom'
import { PieChart, ArrowRight, AlertTriangle, CheckCircle2, PiggyBank } from 'lucide-react'

const BUDGET_ENVELOPES = [
  {
    category: 'Food & Dining',
    spent: 11200,
    limit: 14000,
    status: 'warning',
    statusLabel: '80% Threshold (Spending Warning)',
  },
  {
    category: 'Shopping & Apparel',
    spent: 4100,
    limit: 8000,
    status: 'progress',
    statusLabel: '51% Progress (On Track)',
  },
  {
    category: 'Groceries & Household',
    spent: 8400,
    limit: 12000,
    status: 'normal',
    statusLabel: '70% Allocation (Healthy)',
  },
  {
    category: 'Utilities & Power',
    spent: 4800,
    limit: 6000,
    status: 'warning',
    statusLabel: '80% Threshold (Warning)',
  },
]

export const BudgetProgressWidget = () => {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-card space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div>
          <h3 className="text-base font-bold text-text-primary tracking-tight">
            Budget Envelopes & Limits
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            50% / 80% / 100% automated milestone tracking
          </p>
        </div>
        <Link
          to="/budget"
          className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1"
        >
          <span>All Budgets</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Envelope Progress Bars */}
      <div className="space-y-4">
        {BUDGET_ENVELOPES.map((env, idx) => {
          const percent = Math.round((env.spent / env.limit) * 100)
          const isWarning = percent >= 80

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">{env.category}</span>
                <span className="text-text-secondary">
                  ₹{env.spent.toLocaleString('en-IN')}{' '}
                  <span className="text-text-muted">/ ₹{env.limit.toLocaleString('en-IN')}</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isWarning
                      ? 'bg-warning'
                      : percent >= 50
                      ? 'bg-primary'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className={isWarning ? 'text-warning font-semibold' : 'text-text-muted'}>
                  {env.statusLabel}
                </span>
                <span className="font-mono text-text-muted">{percent}%</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Savings Milestone Quick Card */}
      <div className="p-3.5 rounded-xl bg-background/80 border border-border/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-text-primary block">Emergency Fund</span>
            <span className="text-[10px] text-text-muted">₹1,80,000 / ₹2,50,000 (72%)</span>
          </div>
        </div>
        <Link
          to="/savings"
          className="text-xs font-semibold text-emerald-400 hover:underline"
        >
          View Goal →
        </Link>
      </div>
    </div>
  )
}

export default BudgetProgressWidget
