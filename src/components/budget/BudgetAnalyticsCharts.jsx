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
  ReferenceLine,
} from 'recharts'
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react'

export const BudgetAnalyticsCharts = ({ categoryStats, activePeriod, dateSpendingMap }) => {
  const [activeTab, setActiveTab] = useState('comparison') // 'comparison' | 'utilization' | 'trend'

  // 1. Data for Budget vs Actual Spending Bar Chart
  const comparisonData = categoryStats
    .filter((c) => c.limit > 0)
    .map((c) => ({
      category: c.category,
      Budget: c.limit,
      Actual: c.spent,
    }))

  // 2. Data for Category-wise Budget Utilization Chart
  const utilizationData = categoryStats
    .filter((c) => c.limit > 0)
    .map((c) => ({
      category: c.category,
      utilization: c.percent,
    }))

  // 3. Data for Monthly Spending Trend (cumulative daily spending in active period)
  const trendData = Object.keys(dateSpendingMap || {})
    .sort()
    .map((dateStr) => {
      const dayNum = dateStr.split('-')[2]
      return {
        date: `Day ${dayNum}`,
        spending: dateSpendingMap[dateStr],
      }
    })

  // Custom Dark Tooltip
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
                {entry.dataKey === 'utilization'
                  ? `${entry.value}%`
                  : `₹${entry.value.toLocaleString('en-IN')}`}
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
      {/* Analytics Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Budget Analytics & Intelligence
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-secondary border border-primary/20">
              Live Recharts Engine
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Derived from shared demonstration transactions for {activePeriod.label}.
          </p>
        </div>

        {/* Tab Controls */}
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
            Budget vs Actual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('utilization')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'utilization'
                ? 'bg-card text-text-primary font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Utilization (%)
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
            Spending Trend
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-68 w-full pt-2">
        <ResponsiveContainer width="100%" height={260}>
          {activeTab === 'comparison' ? (
            /* 1. Budget vs Actual Spending Bar Chart */
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-25}
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
              <Bar dataKey="Budget" fill="#334155" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="Actual" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          ) : activeTab === 'utilization' ? (
            /* 2. Category-wise Budget Utilization Chart with Threshold Reference Lines */
            <BarChart data={utilizationData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 120]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={80} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: '80% Warning', fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine y={100} stroke="#EF4444" strokeDasharray="3 3" label={{ value: '100% Limit', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }} />
              <Bar dataKey="utilization" fill="#A78BFA" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          ) : (
            /* 3. Monthly Spending Trend Area Chart */
            <AreaChart data={trendData.length > 0 ? trendData : [{ date: 'Day 1', spending: 0 }]} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
              <defs>
                <linearGradient id="spendTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="spending" name="Daily Expense" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#spendTrendGrad)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Analytics Legend Footer */}
      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-700" />
            <span>Budget Limit</span>
          </span>
          <span className="flex items-center gap-1.5 text-secondary">
            <span className="w-2.5 h-2.5 rounded bg-primary" />
            <span>Actual Outlay</span>
          </span>
          <span className="flex items-center gap-1.5 text-warning">
            <span className="w-2.5 h-0.5 bg-warning" />
            <span>80% Warning Line</span>
          </span>
        </div>
        <span className="font-mono text-[10px]">Deterministic calculations from FinanceContext</span>
      </div>
    </div>
  )
}

export default BudgetAnalyticsCharts
