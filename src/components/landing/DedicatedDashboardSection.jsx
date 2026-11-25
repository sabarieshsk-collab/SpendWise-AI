import React from 'react'
import {
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart as PieIcon,
  PiggyBank,
  CalendarClock,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const cashFlowData = [
  { month: 'Jun', Income: 110000, Expenses: 52000 },
  { month: 'Jul', Income: 115000, Expenses: 49000 },
  { month: 'Aug', Income: 112000, Expenses: 56000 },
  { month: 'Sep', Income: 120000, Expenses: 46000 },
  { month: 'Oct', Income: 120000, Expenses: 48250 },
  { month: 'Nov', Income: 125000, Expenses: 44000 },
]

const categorySpendingData = [
  { name: 'Housing & Rent', value: 22000, color: '#8B5CF6' },
  { name: 'Food & Dining', value: 11200, color: '#38BDF8' },
  { name: 'Groceries', value: 8400, color: '#22C55E' },
  { name: 'Utilities & Bills', value: 4800, color: '#F59E0B' },
  { name: 'Entertainment', value: 3850, color: '#EC4899' },
]

const budgetCategories = [
  {
    name: 'Food & Dining',
    spent: '₹11,200',
    limit: '₹14,000',
    percent: 80,
    status: 'warning',
    statusText: '80% reached (Warning)',
  },
  {
    name: 'Shopping & Apparel',
    spent: '₹4,100',
    limit: '₹8,000',
    percent: 51,
    status: 'progress',
    statusText: '51% reached (Progress)',
  },
  {
    name: 'Groceries & Household',
    spent: '₹8,400',
    limit: '₹12,000',
    percent: 70,
    status: 'normal',
    statusText: '70% healthy limit',
  },
]

const upcomingObligations = [
  {
    title: 'Home Loan EMI',
    category: 'Loan Account',
    amount: '₹24,500',
    dueDate: 'Due in 4 days',
    icon: CalendarClock,
    badge: 'EMI',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  },
  {
    title: 'Car Loan EMI',
    category: 'Auto Finance',
    amount: '₹8,200',
    dueDate: 'Due in 11 days',
    icon: CalendarClock,
    badge: 'EMI',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  },
  {
    title: 'Cloud Storage & Workspace',
    category: 'Subscription',
    amount: '₹1,499',
    dueDate: 'Renews in 6 days',
    icon: CreditCard,
    badge: 'Sub',
    badgeColor: 'bg-purple-500/15 text-secondary border-purple-500/20',
  },
  {
    title: 'Streaming & Music Pass',
    category: 'Subscription',
    amount: '₹649',
    dueDate: 'Renews in 9 days',
    icon: CreditCard,
    badge: 'Sub',
    badgeColor: 'bg-purple-500/15 text-secondary border-purple-500/20',
  },
]

export const DedicatedDashboardSection = () => {
  return (
    <section id="dashboard-preview" className="py-20 md:py-28 bg-sidebar/30 border-t border-border/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-secondary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unified Platform Dashboard</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
            Your Finances. All in One Dashboard.
          </h2>

          <p className="text-base text-text-secondary leading-relaxed">
            Experience complete control over every rupee. Explore real-time cash flow metrics, category expenditure distributions, budget limit monitoring, and loan commitments in one clean console.
          </p>

          <div className="inline-block mt-2 px-3 py-1 rounded-md bg-white/5 border border-border text-xs font-mono text-secondary">
            DEMONSTRATION PREVIEW • ALL FIGURES ARE SAMPLE INR DATA
          </div>
        </div>

        {/* Dashboard Frame Container */}
        <div className="rounded-2xl bg-card border border-border shadow-2xl p-5 sm:p-8 space-y-6 backdrop-blur-xl">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Balance */}
            <div className="p-4 rounded-xl bg-background/80 border border-border">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Total Balance</span>
                <span className="p-1 rounded bg-primary/10 text-secondary">
                  <Wallet className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-2xl font-bold text-text-primary mt-1">₹2,48,500</div>
              <div className="flex items-center gap-1 text-[11px] text-success mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+14.2% from last month</span>
              </div>
            </div>

            {/* Monthly Income */}
            <div className="p-4 rounded-xl bg-background/80 border border-border">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Monthly Income</span>
                <span className="p-1 rounded bg-success/10 text-success">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-2xl font-bold text-text-primary mt-1">₹1,20,000</div>
              <div className="text-[11px] text-text-muted mt-1">Primary Salary + Side Stash</div>
            </div>

            {/* Monthly Expenses */}
            <div className="p-4 rounded-xl bg-background/80 border border-border">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Monthly Expenses</span>
                <span className="p-1 rounded bg-warning/10 text-warning">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-2xl font-bold text-text-primary mt-1">₹48,250</div>
              <div className="text-[11px] text-secondary mt-1">40.2% of current income</div>
            </div>

            {/* Net Savings Stash */}
            <div className="p-4 rounded-xl bg-background/80 border border-border">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Monthly Net Savings</span>
                <span className="p-1 rounded bg-primary/10 text-secondary">
                  <PiggyBank className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-2xl font-bold text-success mt-1">+₹71,750</div>
              <div className="text-[11px] text-text-muted mt-1">59.8% effective savings rate</div>
            </div>
          </div>

          {/* Charts Row: Income vs Expenses & Spending Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Income vs Expenses Bar Chart */}
            <div className="lg:col-span-7 p-5 rounded-xl bg-background/80 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Income vs. Expense Trend</h4>
                  <p className="text-xs text-text-secondary">Monthly comparison across the last 6 cycles</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-secondary">
                    <span className="w-2.5 h-2.5 rounded bg-primary" /> Income
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded bg-slate-600" /> Expenses
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `₹${v / 1000}k`}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                      contentStyle={{
                        backgroundColor: '#151E33',
                        borderColor: '#1E293B',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#F8FAFC',
                      }}
                      formatter={(val) => [`₹${val.toLocaleString()}`, '']}
                    />
                    <Bar dataKey="Income" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Expenses" fill="#475569" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Spending Category Pie Chart */}
            <div className="lg:col-span-5 p-5 rounded-xl bg-background/80 border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Spending by Category</h4>
                  <p className="text-xs text-text-secondary">Current billing cycle distribution</p>
                </div>
                <PieIcon className="w-4 h-4 text-secondary" />
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpendingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categorySpendingData.map((entry, index) => (
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
                      formatter={(val) => [`₹${val.toLocaleString()}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend List */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                {categorySpendingData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-text-secondary truncate">{item.name}</span>
                    <span className="font-semibold text-text-primary ml-auto text-[11px]">
                      ₹{(item.value / 1000).toFixed(1)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid: Budget Utilization, Savings Goals, and Upcoming Obligations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Budget Utilization */}
            <div className="p-5 rounded-xl bg-background/80 border border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-text-primary">Budget Utilization</h4>
                  <span className="text-xs text-secondary font-medium">3 Active Envelopes</span>
                </div>

                <div className="space-y-4">
                  {budgetCategories.map((cat, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-text-primary">{cat.name}</span>
                        <span className="text-text-secondary">
                          {cat.spent} / <span className="text-text-muted">{cat.limit}</span>
                        </span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            cat.percent >= 80 ? 'bg-warning' : 'bg-primary'
                          }`}
                          style={{ width: `${cat.percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-text-muted block">{cat.statusText}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 text-xs text-text-muted">
                Automatic warnings triggered when spending reaches 80%.
              </div>
            </div>

            {/* 2. Savings Progress */}
            <div className="p-5 rounded-xl bg-background/80 border border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-text-primary">Savings Progress</h4>
                  <span className="p-1 rounded bg-primary/10 text-secondary">
                    <PiggyBank className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="space-y-5">
                  {/* Emergency Fund */}
                  <div className="p-3 rounded-lg bg-card border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-primary">Emergency Reserve Fund</span>
                      <span className="font-bold text-secondary">72%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
                        style={{ width: '72%' }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-text-secondary">
                      <span>Saved: ₹1,80,000</span>
                      <span>Target: ₹2,50,000</span>
                    </div>
                  </div>

                  {/* Travel & Vacation */}
                  <div className="p-3 rounded-lg bg-card border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-primary">Annual Vacation Goal</span>
                      <span className="font-bold text-emerald-400">75%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full"
                        style={{ width: '75%' }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-text-secondary">
                      <span>Saved: ₹45,000</span>
                      <span>Target: ₹60,000</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-1.5 text-xs text-success">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>On track to reach both targets by Q4</span>
              </div>
            </div>

            {/* 3. Upcoming EMI and Subscription Payments */}
            <div className="p-5 rounded-xl bg-background/80 border border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-text-primary">Upcoming Obligations</h4>
                  <span className="text-xs text-text-muted">Next 14 Days</span>
                </div>

                <div className="space-y-2.5">
                  {upcomingObligations.map((item, idx) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-card border border-border flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-text-secondary shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <p className="font-medium text-text-primary truncate">{item.title}</p>
                            <p className="text-[10px] text-text-muted">{item.dueDate}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-2">
                          <p className="font-semibold text-text-primary">{item.amount}</p>
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold border ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 text-xs text-text-muted text-center">
                Total upcoming outgo: <strong className="text-text-primary">₹34,848</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DedicatedDashboardSection
