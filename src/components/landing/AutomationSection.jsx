import React from 'react'
import { CalendarClock, CreditCard, AlertTriangle, Zap, ArrowRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

const automationCards = [
  {
    title: 'EMI Reminders',
    status: 'Planned Capability',
    description: 'Get notified before upcoming loan EMI dates.',
    details: 'Planned automated 3-day and 24-hour advance payment reminders designed to help users prepare upcoming installments and avoid late penalty charges once external workflow engines are connected.',
    icon: CalendarClock,
    badge: 'Loan Workflows',
    color: 'from-blue-500/20 to-primary/20 text-blue-400',
    sampleNotification: 'Home Loan EMI of ₹24,500 due in 3 days (Simulated trigger).',
  },
  {
    title: 'Subscription Alerts',
    status: 'Planned Capability',
    description: 'Receive advance renewal and expiry reminders.',
    details: 'Planned tracking alerts for monthly and annual renewals, trial period expirations, and subscription billing cycle updates, keeping users informed prior to recurring debits.',
    icon: CreditCard,
    badge: 'Recurring Expenses',
    color: 'from-purple-500/20 to-secondary/20 text-secondary',
    sampleNotification: 'Annual Cloud Storage (₹2,199) renews in 5 days (Simulated trigger).',
  },
  {
    title: 'Smart Budget Alerts',
    status: 'Planned Capability',
    description: 'Get notified when spending approaches your budget limits.',
    details: 'Configured with intelligent three-tier threshold triggers: 50% (Budget progress update), 80% (Spending warning), and 100% (Budget limit reached), giving you timely visibility before overspending.',
    icon: AlertTriangle,
    badge: 'Limit Enforcers',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400',
    sampleNotification: 'Dining budget reached 80% (Spending warning). ₹3,200 remaining for the cycle.',
    thresholds: [
      { level: '50%', text: 'Budget progress update' },
      { level: '80%', text: 'Spending warning' },
      { level: '100%', text: 'Budget limit reached' },
    ],
  },
]

export const AutomationSection = () => {
  return (
    <section id="automation" className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute bottom-0 right-1/3 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Workflow Automation (Architecture Blueprint)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Never Miss an Important Payment Again
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            SpendWise AI is architected to utilize workflow automation to help users stay informed. Planned notifications and reminders will keep you proactive across all recurring financial commitments.
          </p>
        </div>

        {/* 3 Automation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {automationCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <div
                key={idx}
                className="group rounded-2xl bg-card border border-border p-6 flex flex-col justify-between transition-all duration-300 hover:border-primary/40 hover:shadow-card hover:-translate-y-1"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} border border-white/5 flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-secondary border border-primary/20">
                        <Clock className="w-2.5 h-2.5" />
                        {card.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-text-primary mb-2 tracking-tight group-hover:text-secondary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm font-medium text-text-primary/90 mb-2">
                    {card.description}
                  </p>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    {card.details}
                  </p>

                  {/* Thresholds Pill Box if present */}
                  {card.thresholds && (
                    <div className="mb-4 p-2.5 rounded-lg bg-background/80 border border-border/80 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                        Standard Trigger Milestones
                      </span>
                      <div className="space-y-1">
                        {card.thresholds.map((t, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-secondary">{t.level}</span>
                            <span className="text-text-secondary">{t.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulated Notification Toast preview */}
                <div className="rounded-xl bg-background/80 border border-border/80 p-3 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-text-muted">
                    <span className="font-semibold text-text-primary text-[10px] uppercase tracking-wider">
                      Planned Trigger Preview
                    </span>
                    <span>Sample</span>
                  </div>
                  <p className="text-text-secondary italic">"{card.sampleNotification}"</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default AutomationSection
