import React, { useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { BarChart3, TrendingUp, History } from 'lucide-react'

export const SavingsAnalyticsCharts = ({ savingsGoals }) => {
  const [activeTab, setActiveTab] = useState('comparison') // 'comparison' | 'contributions'

  // 1. Goal Progress Comparison Data (Target vs Saved)
  const comparisonData = savingsGoals.map((g) => ({
    name: g.name.length > 15 ? `${g.name.substring(0, 15)}...` : g.name,
    fullName: g.name,
    Target: g.targetAmount,
    Saved: g.savedAmount,
    Remaining: Math.max(0, g.targetAmount - g.savedAmount),
    percent: g.targetAmount > 0 ? Math.round((g.savedAmount / g.targetAmount) * 100) : 0,
  }))

  // 2. Savings Contribution Timeline Data (aggregate contributions across goals sorted by date)
  const allContributions = []
  savingsGoals.forEach((g) => {
    (g.contributions || []).forEach((c) => {
      allContributions.push({
        date: c.date,
        amount: c.amount,
        goalName: g.name,
        note: c.note,
      })
    })
  })

  // Sort and group by date
  const contributionsByDateMap = {}
  allContributions.forEach((c) => {
    contributionsByDateMap[c.date] = (contributionsByDateMap[c.date] || 0) + c.amount
  })

  const contributionTimeline = Object.keys(contributionsByDateMap)
    .sort()
    .map((d) => ({
      date: d,
      Deposit: contributionsByDateMap[d],
    }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-card border border-border p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <p className="font-bold text-text-primary border-b border-border/80 pb-1">{label}</p>
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
              Savings Intelligence & Analytics
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-secondary border border-primary/20">
              Dynamic Recharts
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time capital accumulation and milestone trajectory analysis.
          </p>
        </div>

        <div className="p-0.5 rounded-xl bg-background border border-border flex items-center text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'comparison'
                ? 'bg-card text-text-primary font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Target vs Saved
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contributions')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'contributions'
                ? 'bg-card text-text-primary font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Deposit History
          </button>
        </div>
      </div>

      <div className="h-68 w-full pt-2">
        <ResponsiveContainer width="100%" height={260}>
          {activeTab === 'comparison' ? (
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
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
              <Bar dataKey="Target" fill="#334155" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Saved" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          ) : (
            <AreaChart
              data={
                contributionTimeline.length > 0
                  ? contributionTimeline
                  : [{ date: 'Today', Deposit: 0 }]
              }
              margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="Deposit"
                name="Deposit Added"
                stroke="#22C55E"
                strokeWidth={2.5}
                fill="url(#savingsGrad)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-700" />
            <span>Target Milestone</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span>Actual Saved</span>
          </span>
        </div>
        <span className="font-mono text-[10px]">
          {allContributions.length} verified contribution deposits logged
        </span>
      </div>
    </div>
  )
}

export default SavingsAnalyticsCharts
