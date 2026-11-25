import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { PieChart as PieIcon, ArrowUpRight } from 'lucide-react'

const CATEGORY_DATA = [
  { name: 'Housing & Rent', value: 18000, color: '#8B5CF6' },
  { name: 'Food & Dining', value: 11200, color: '#38BDF8' },
  { name: 'Groceries & Mart', value: 8400, color: '#22C55E' },
  { name: 'Utilities & Bills', value: 4800, color: '#F59E0B' },
  { name: 'Subscriptions', value: 3200, color: '#EC4899' },
  { name: 'Transit & Fuel', value: 2650, color: '#A78BFA' },
]

export const CategorySpendingChart = () => {
  const total = CATEGORY_DATA.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div>
          <h3 className="text-base font-bold text-text-primary tracking-tight">
            Spending by Category
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Total outgo: ₹{total.toLocaleString('en-IN')} (This cycle)
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-secondary flex items-center justify-center">
          <PieIcon className="w-4 h-4" />
        </div>
      </div>

      {/* Donut Chart */}
      <div className="h-56 w-full flex items-center justify-center relative my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={CATEGORY_DATA}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={4}
              dataKey="value"
            >
              {CATEGORY_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#151E33',
                borderColor: '#1E293B',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#F8FAFC',
              }}
              formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-text-muted uppercase tracking-wider">Top Category</span>
          <span className="text-xs font-bold text-text-primary">Housing 37%</span>
        </div>
      </div>

      {/* Category breakdown pill list */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        {CATEGORY_DATA.slice(0, 4).map((cat, idx) => {
          const percent = ((cat.value / total) * 100).toFixed(1)
          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-text-secondary truncate">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-text-primary">₹{cat.value.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-text-muted">({percent}%)</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CategorySpendingChart
