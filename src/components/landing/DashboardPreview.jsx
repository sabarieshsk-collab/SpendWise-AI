import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  CheckCircle2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const monthlyChartData = [
  { month: 'Jun', income: 110000, expense: 52000 },
  { month: 'Jul', income: 115000, expense: 49000 },
  { month: 'Aug', income: 112000, expense: 56000 },
  { month: 'Sep', income: 120000, expense: 46000 },
  { month: 'Oct', income: 120000, expense: 48250 },
]

const recentTransactions = [
  {
    id: 1,
    title: 'Salary Credit - TechCorp',
    category: 'Income',
    amount: '+₹1,20,000',
    type: 'income',
    date: 'Oct 31',
  },
  {
    id: 2,
    title: 'Supermarket & Groceries',
    category: 'Essential',
    amount: '-₹3,450',
    type: 'expense',
    date: 'Today',
  },
  {
    id: 3,
    title: 'Cloud & Entertainment Pack',
    category: 'Subscription',
    amount: '-₹899',
    type: 'expense',
    date: 'Yesterday',
  },
]

export const DashboardPreview = () => {
  return (
    <div className="relative rounded-2xl bg-card/95 border border-border p-4 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4 max-w-xl mx-auto lg:max-w-none text-left">
      {/* Decorative Gradient Glows */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar of preview */}
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-danger/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-warning/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-success/80"></div>
          <span className="text-xs font-medium text-text-muted ml-2">
            SpendWise Live Engine
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-border text-[10px] font-semibold text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span>SAMPLE INR DATA</span>
        </div>
      </div>

      {/* Top Metrics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Balance */}
        <div className="p-3.5 rounded-xl bg-background/80 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-text-secondary">Total Balance</span>
            <span className="p-1 rounded-md bg-primary/10 text-secondary">
              <Wallet className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg font-bold text-text-primary mt-1">₹2,48,500</div>
          <div className="flex items-center gap-1 text-[10px] text-success mt-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% this month</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="p-3.5 rounded-xl bg-background/80 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-text-secondary">Monthly Income</span>
            <span className="p-1 rounded-md bg-success/10 text-success">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg font-bold text-text-primary mt-1">₹1,20,000</div>
          <div className="text-[10px] text-text-muted mt-0.5">On track with budget</div>
        </div>

        {/* Monthly Expenses */}
        <div className="p-3.5 rounded-xl bg-background/80 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-text-secondary">Monthly Expenses</span>
            <span className="p-1 rounded-md bg-warning/10 text-warning">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg font-bold text-text-primary mt-1">₹48,250</div>
          <div className="flex items-center gap-1 text-[10px] text-secondary mt-0.5">
            <span>40.2% of income</span>
          </div>
        </div>
      </div>

      {/* Mid Section: Savings Goal + Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Savings Goal Progress */}
        <div className="sm:col-span-5 p-3.5 rounded-xl bg-background/80 border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <PiggyBank className="w-4 h-4 text-secondary" />
                <span className="text-xs font-semibold text-text-primary">Emergency Fund</span>
              </div>
              <span className="text-xs font-bold text-secondary">72%</span>
            </div>
            <p className="text-[11px] text-text-secondary">₹1,80,000 of ₹2,50,000 target</p>
          </div>

          <div className="my-2">
            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500"
                style={{ width: '72%' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-success">
            <CheckCircle2 className="w-3 h-3" />
            <span>₹8,500 added this month</span>
          </div>
        </div>

        {/* Income vs Expense Mini Chart */}
        <div className="sm:col-span-7 p-3.5 rounded-xl bg-background/80 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-primary">Cash Flow Trend</span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-secondary">
                <span className="w-2 h-2 rounded-full bg-primary" /> Income
              </span>
              <span className="flex items-center gap-1 text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-slate-500" /> Expense
              </span>
            </div>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{
                    backgroundColor: '#151E33',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F8FAFC',
                  }}
                  formatter={(val) => [`₹${val.toLocaleString()}`, '']}
                />
                <Bar dataKey="income" fill="#8B5CF6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" fill="#475569" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & AI Insight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Recent Transactions List */}
        <div className="p-3.5 rounded-xl bg-background/80 border border-border">
          <span className="text-xs font-semibold text-text-primary block mb-2">
            Recent Transactions
          </span>
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <p className="font-medium text-text-primary truncate">{tx.title}</p>
                  <p className="text-[10px] text-text-muted">{tx.date} • {tx.category}</p>
                </div>
                <span
                  className={`font-semibold shrink-0 ${
                    tx.type === 'income' ? 'text-success' : 'text-text-primary'
                  }`}
                >
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Financial Insight Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-primary/15 via-sidebar to-background border border-primary/30 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-secondary text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Autonomous Insight</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed my-1">
            "Dining expenses dropped <span className="text-text-primary font-medium">18%</span> this week. You have <span className="text-success font-medium">₹4,200</span> additional surplus to invest or allocate to your Emergency Fund."
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-primary/20 text-[10px] text-secondary">
            <span>Confidence: 98.4%</span>
            <span className="font-medium hover:underline cursor-pointer">Apply Suggestion →</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPreview
