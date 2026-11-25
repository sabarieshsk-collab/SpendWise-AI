import React, { useState } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { CreditCard, PieChart as PieIcon, Calendar, Layers } from 'lucide-react'
import { calculateMonthlyEquivalent } from '../../context'

const COLORS = ['#8B5CF6', '#22C55E', '#F59E0B', '#3B82F6', '#EC4899', '#06B6D4', '#64748B']

export const SubscriptionAnalyticsCharts = ({ subscriptions }) => {
  const [activeTab, setActiveTab] = useState('category') // 'category' | 'services' | 'timeline'

  // Exclusively consider ACTIVE subscriptions for recurring cost analytics!
  const activeSubs = subscriptions.filter((s) => s.status === 'Active')

  // 1. Monthly recurring cost by Category
  const categoryCostMap = {}
  activeSubs.forEach((s) => {
    const monthlyVal = calculateMonthlyEquivalent(s.amount, s.frequency)
    categoryCostMap[s.category] = (categoryCostMap[s.category] || 0) + monthlyVal
  })

  const categoryData = Object.keys(categoryCostMap).map((cat) => ({
    name: cat,
    value: categoryCostMap[cat],
  }))

  // 2. Individual subscription cost ranking (Monthly Normalized)
  const serviceData = activeSubs
    .map((s) => ({
      name: s.name.length > 14 ? `${s.name.substring(0, 14)}...` : s.name,
      fullName: s.name,
      monthly: calculateMonthlyEquivalent(s.amount, s.frequency),
      rawAmount: s.amount,
      frequency: s.frequency,
    }))
    .sort((a, b) => b.monthly - a.monthly)

  // 3. Upcoming Renewal Timeline (next renewals)
  const timelineData = subscriptions
    .filter((s) => s.status !== 'Cancelled')
    .map((s) => ({
      name: s.name.length > 12 ? `${s.name.substring(0, 12)}...` : s.name,
      date: s.nextRenewalDate,
      amount: s.amount,
      status: s.status,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8)

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
                ₹{Number(entry.value).toLocaleString('en-IN')}/mo
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
              Subscription Cost Intelligence
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-secondary border border-primary/20">
              Active Plans Only
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Breakdown of normalized monthly recurring burn rate across active subscriptions.
          </p>
        </div>

        <div className="p-0.5 rounded-xl bg-background border border-border flex items-center text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('category')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'category'
                ? 'bg-card text-text-primary font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            By Category
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-card text-text-primary font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Cost Ranking
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'timeline'
                ? 'bg-card text-text-primary font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Renewal Timeline
          </button>
        </div>
      </div>

      <div className="h-68 w-full pt-2">
        <ResponsiveContainer width="100%" height={260}>
          {activeTab === 'category' ? (
            <PieChart>
              <Pie
                data={categoryData.length > 0 ? categoryData : [{ name: 'None', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
              />
            </PieChart>
          ) : activeTab === 'services' ? (
            <BarChart data={serviceData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
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
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="monthly" name="Monthly Impact" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          ) : (
            <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
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
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = timelineData.find((t) => t.name === label)
                    return (
                      <div className="rounded-xl bg-card border border-border p-3 shadow-2xl text-xs space-y-1">
                        <p className="font-bold text-text-primary">{label}</p>
                        <p className="text-text-muted">Due: {item?.date}</p>
                        <p className="font-semibold text-secondary">
                          Charge: ₹{item?.amount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="amount" name="Renewal Charge" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-secondary">
            <span className="w-2.5 h-2.5 rounded bg-primary" />
            <span>Monthly Equivalent</span>
          </span>
          <span className="flex items-center gap-1.5 text-text-muted">
            <span>Paused & Cancelled memberships excluded from burn rate</span>
          </span>
        </div>
        <span className="font-mono text-[10px]">
          {activeSubs.length} active recurring contracts
        </span>
      </div>
    </div>
  )
}

export default SubscriptionAnalyticsCharts
