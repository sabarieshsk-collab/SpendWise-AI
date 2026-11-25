import React, { useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Landmark, PieChart as PieIcon, BarChart3 } from 'lucide-react'

const PIE_COLORS = ['#8B5CF6', '#22C55E', '#F59E0B', '#3B82F6', '#EC4899', '#14B8A6']

export const LoanAnalyticsCharts = ({ loans }) => {
  const [activeTab, setActiveTab] = useState('balance') // 'balance' | 'repayment' | 'emi'

  // 1. Outstanding Balance by Loan (Bar & Pie data)
  const balanceData = loans.map((l) => ({
    name: l.name.length > 14 ? `${l.name.substring(0, 14)}...` : l.name,
    fullName: l.name,
    value: l.balance,
    principal: l.principal,
    repaid: Math.max(0, l.principal - l.balance),
    emi: l.emi,
  }))

  // 2. Repayment Progress Comparison (Principal vs Repaid vs Outstanding)
  const repaymentComparison = loans.map((l) => ({
    name: l.name.length > 12 ? `${l.name.substring(0, 12)}...` : l.name,
    Repaid: Math.max(0, l.principal - l.balance),
    Outstanding: l.balance,
  }))

  // 3. EMI Commitment Breakdown
  const emiBreakdown = loans.map((l) => ({
    name: l.name.length > 12 ? `${l.name.substring(0, 12)}...` : l.name,
    EMI: l.emi,
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-card border border-border p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <p className="font-bold text-text-primary border-b border-border/80 pb-1">
            {label || payload[0]?.name}
          </p>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color || entry.fill }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-semibold text-text-primary">
                ₹{Number(entry.value).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Debt Portfolio & Amortization Analytics
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-secondary border border-primary/20">
              Interactive Recharts
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time liability distribution, repayment payoff ratios and monthly commitments.
          </p>
        </div>

        <div className="p-0.5 rounded-xl bg-background border border-border flex items-center text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('balance')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'balance'
                ? 'bg-card text-text-primary font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Outstanding Balance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('repayment')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'repayment'
                ? 'bg-card text-text-primary font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Repaid vs Debt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emi')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'emi'
                ? 'bg-card text-text-primary font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Monthly EMI
          </button>
        </div>
      </div>

      <div className="h-68 w-full pt-2">
        <ResponsiveContainer width="100%" height={260}>
          {activeTab === 'balance' ? (
            <BarChart data={balanceData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Outstanding Balance" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          ) : activeTab === 'repayment' ? (
            <BarChart data={repaymentComparison} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Repaid" fill="#22C55E" stackId="a" radius={[0, 0, 0, 0]} maxBarSize={36} />
              <Bar dataKey="Outstanding" fill="#EF4444" stackId="a" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          ) : (
            <BarChart data={emiBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="EMI" name="Monthly Installment" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-danger">
            <span className="w-2.5 h-2.5 rounded bg-danger" />
            <span>Outstanding Debt</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span>Principal Paid Down</span>
          </span>
          <span className="flex items-center gap-1.5 text-secondary">
            <span className="w-2.5 h-2.5 rounded bg-primary" />
            <span>Monthly EMI</span>
          </span>
        </div>
        <span className="font-mono text-[10px]">
          Amortization schedules calculated via FinanceContext
        </span>
      </div>
    </div>
  )
}

export default LoanAnalyticsCharts
