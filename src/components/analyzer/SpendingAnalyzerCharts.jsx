import React, { useState } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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
import { PieChart as PieIcon, BarChart3, TrendingUp } from 'lucide-react'
import { formatINR } from '../../services/spendingAnalyzerService'

const PALETTE = [
  '#8B5CF6',
  '#22C55E',
  '#F59E0B',
  '#3B82F6',
  '#EC4899',
  '#06B6D4',
  '#10B981',
  '#6366F1',
  '#F97316',
  '#A855F7',
  '#64748B',
]

export const SpendingAnalyzerCharts = ({ categories, transactions, period }) => {
  const [activeTab, setActiveTab] = useState('donut') // 'donut' | 'bars' | 'trend'

  // 1. Donut chart data (categories with spend > 0)
  const donutData = categories
    .filter((c) => c.total > 0)
    .map((c) => ({
      name: c.name,
      value: c.total,
      percentage: c.percentage,
    }))

  // 2. Bar chart data (comparing Actual Spent vs Budget Limit if available)
  const barData = categories
    .filter((c) => c.total > 0 || c.budgetLimit > 0)
    .slice(0, 8)
    .map((c) => ({
      name: c.name.length > 12 ? `${c.name.substring(0, 12)}...` : c.name,
      fullName: c.name,
      Spent: c.total,
      Budget: c.budgetLimit || 0,
    }))

  // 3. Daily spending trend in selected period
  const periodTxs = transactions.filter(
    (t) =>
      t.type === 'expense' &&
      t.date >= period.startDate &&
      t.date <= period.endDate
  )

  const dateMap = {}
  periodTxs.forEach((t) => {
    dateMap[t.date] = (dateMap[t.date] || 0) + t.amount
  })

  const trendData = Object.keys(dateMap)
    .sort()
    .map((d) => {
      const day = d.split('-')[2]
      return {
        date: `Day ${day}`,
        fullDate: d,
        Outflow: dateMap[d],
      }
    })

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-card border border-border p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md text-left">
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
                {formatINR(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-card space-y-4 text-left">
      {/* Header and Chart Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Spending Distribution & Trends
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-secondary border border-primary/20">
              Interactive Recharts
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Derived directly from ledger transactions for {period.label}.
          </p>
        </div>

        <div className="p-0.5 rounded-xl bg-background border border-border flex items-center text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('donut')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'donut'
                ? 'bg-card text-text-primary font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Category Donut
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bars')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'bars'
                ? 'bg-card text-text-primary font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Spent vs Budget
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'trend'
                ? 'bg-card text-text-primary font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Daily Outflow
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height={270}>
          {activeTab === 'donut' ? (
            <PieChart>
              <Pie
                data={donutData.length > 0 ? donutData : [{ name: 'No Expenses', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value, entry) => (
                  <span className="text-xs text-text-secondary mr-2">{value}</span>
                )}
              />
            </PieChart>
          ) : activeTab === 'bars' ? (
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
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
              <Bar dataKey="Budget" fill="#334155" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="Spent" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          ) : (
            <AreaChart
              data={trendData.length > 0 ? trendData : [{ date: 'Day 1', Outflow: 0 }]}
              margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="analyzerTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
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
                dataKey="Outflow"
                name="Daily Expense"
                stroke="#8B5CF6"
                strokeWidth={2.5}
                fill="url(#analyzerTrendGrad)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-secondary">
            <span className="w-2.5 h-2.5 rounded bg-primary" />
            <span>Actual Outlay</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-700" />
            <span>Allocated Limit</span>
          </span>
        </div>
        <span className="font-mono text-[10px]">
          {donutData.length} active spending envelopes tracked
        </span>
      </div>
    </div>
  )
}

export default SpendingAnalyzerCharts
