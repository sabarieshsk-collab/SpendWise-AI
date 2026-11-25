import React from 'react'
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  PiggyBank,
  Landmark,
  CreditCard,
  Bot,
  TrendingUp,
  BellRing,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    id: 1,
    title: 'Smart Dashboard',
    description: 'Get a complete overview of your finances with real-time balance metrics, cash flow breakdowns, and portfolio health indicators.',
    icon: LayoutDashboard,
    badge: 'Core',
    color: 'from-blue-500/20 to-primary/20 text-blue-400',
  },
  {
    id: 2,
    title: 'Expense Tracking',
    description: 'Monitor income and expenses in one place with automatic multi-tag categorization and instant receipt capture.',
    icon: Receipt,
    badge: 'Real-time',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
  },
  {
    id: 3,
    title: 'Smart Budget Planner',
    description: 'Set spending limits and monitor budget usage with dynamic category envelopes and proactive threshold warnings.',
    icon: PieChart,
    badge: 'Planning',
    color: 'from-purple-500/20 to-indigo-500/20 text-purple-400',
  },
  {
    id: 4,
    title: 'Savings Goals',
    description: 'Track savings targets and monitor progress toward emergency funds, investments, and personal milestones.',
    icon: PiggyBank,
    badge: 'Wealth',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400',
  },
  {
    id: 5,
    title: 'Loan & EMI Manager',
    description: 'Manage loans and receive upcoming EMI reminders with debt payoff projections and interest optimization.',
    icon: Landmark,
    badge: 'Debt Control',
    color: 'from-rose-500/20 to-red-500/20 text-rose-400',
  },
  {
    id: 6,
    title: 'Subscription Manager',
    description: 'Monitor recurring subscriptions, renewal dates and expiry dates to avoid surprise renewals and stealth price hikes.',
    icon: CreditCard,
    badge: 'Optimizer',
    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400',
  },
  {
    id: 7,
    title: 'AI Financial Assistant',
    description: 'Ask questions and receive explanations based on your financial records through natural conversational intelligence.',
    icon: Bot,
    badge: 'AI Powered',
    color: 'from-primary/25 to-secondary/25 text-secondary',
    isAi: true,
  },
  {
    id: 8,
    title: 'AI Spending Analyzer',
    description: 'Understand spending patterns and identify potential savings through deep behavioral clustering and predictive forecasting.',
    icon: TrendingUp,
    badge: 'Smart Diagnostics',
    color: 'from-indigo-500/20 to-primary/20 text-indigo-400',
    isAi: true,
  },
  {
    id: 9,
    title: 'Automated Financial Alerts',
    description: 'Receive reminders and notifications through automated workflows before due dates, overspending limits, or anomalies occur.',
    icon: BellRing,
    badge: 'Automation',
    color: 'from-violet-500/20 to-fuchsia-500/20 text-secondary',
  },
]

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-sidebar/40 border-y border-border/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-secondary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comprehensive Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Everything You Need to Manage Your Money
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            SpendWise AI unifies your day-to-day transaction records, long-term wealth planning, and predictive AI analytics into a unified, secure fintech console.
          </p>
        </div>

        {/* Feature Cards Grid (3x3 on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.id}
                className={`group relative rounded-2xl bg-card border border-border p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-card hover:-translate-y-1 flex flex-col justify-between ${
                  feature.isAi ? 'ring-1 ring-primary/30' : ''
                }`}
              >
                {/* Subtle Glow on Hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div>
                  {/* Icon & Badge Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} border border-white/5 flex items-center justify-center transition-transform group-hover:scale-105`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 text-text-secondary border border-border group-hover:border-primary/30 group-hover:text-secondary transition-colors">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-text-primary mb-2 tracking-tight group-hover:text-secondary transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom subtle indicator line */}
                <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
                  <span className="font-mono text-[11px]">0{feature.id}</span>
                  <span className="group-hover:text-secondary transition-colors font-medium">Learn more →</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
