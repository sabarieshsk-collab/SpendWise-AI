import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { BarChart3, TrendingUp, Sparkles } from 'lucide-react'

const SIX_MONTH_DATA = [
  { month: 'June', Income: 85000, Expenses: 42000 },
  { month: 'July', Income: 92000, Expenses: 45000 },
  { month: 'August', Income: 98000, Expenses: 51000 },
  { month: 'September', Income: 105000, Expenses: 48000 },
  { month: 'October', Income: 112000, Expenses: 52000 },
  { month: 'November', Income: 120000, Expenses: 48250 },
]

export const IncomeExpenseChart = () => {
  const [chartType, setChartType] = useState('bar') // 'bar' | 'area'

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const income = payload.find((p) => p.dataKey === 'Income')?.value || 0
      const expenses = payload.find((p) => p.dataKey === 'Expenses')?.value || 0
      const netSavings = income - expenses

      return (
        <div className="rounded-xl bg-card border border-border p-3.5 shadow-2xl space-y-2 text-xs backdrop-blur-md">
          <div className="font-bold text-text-primary border-b border-border/80 pb-1 flex items-center justify-between gap-4">
            <span>{label} 2026</span>
            <span className="text-[10px] text-text-muted">Sample Data</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-secondary">
                <span className="w-2 h-2 rounded-full bg-primary" /> Income
              </span>
              <span className="font-semibold text-text-primary">
                ₹{income.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500" /> Expenses
              </span>
              <span className="font-semibold text-text-primary">
                ₹{expenses.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-border/60">
              <span className="text-success font-medium">Net Surplus</span>
              <span className="font-bold text-success">
                +₹{netSavings.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-card space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Income vs Expenses
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-secondary border border-primary/20">
              6-Month Trend
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Compare monthly inflows and cash outlays over the past six cycles.
          </p>
        </div>

        {/* Chart View Toggle & Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="w-2.5 h-2.5 rounded bg-primary" />
              <span>Income</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-slate-500" />
              <span>Expenses</span>
            </div>
          </div>

          <div className="p-0.5 rounded-lg bg-background border border-border flex items-center">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                chartType === 'bar'
                  ? 'bg-card text-text-primary shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Bar
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                chartType === 'area'
                  ? 'bg-card text-text-primary shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Area
            </button>
          </div>
        </div>
      </div>

      {/* Chart Visual Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={SIX_MONTH_DATA}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Income" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={38} />
              <Bar dataKey="Expenses" fill="#475569" radius={[4, 4, 0, 0]} maxBarSize={38} />
            </BarChart>
          ) : (
            <AreaChart
              data={SIX_MONTH_DATA}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="Income"
                stroke="#8B5CF6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#incomeGrad)"
              />
              <Area
                type="monotone"
                dataKey="Expenses"
                stroke="#64748B"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expenseGrad)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Highlights */}
      <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-2">
        <span className="flex items-center gap-1.5 text-success">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Average monthly savings: <strong>₹52,791</strong> (+48.3% margin)</span>
        </span>
        <span className="font-mono text-[11px] text-text-muted">
          All values presented in Indian Rupees (₹)
        </span>
      </div>
    </div>
  )
}

export default IncomeExpenseChart
