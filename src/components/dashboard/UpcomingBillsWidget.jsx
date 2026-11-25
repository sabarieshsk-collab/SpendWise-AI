import React from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, CreditCard, Landmark, ArrowRight, Clock } from 'lucide-react'

const UPCOMING_BILLS = [
  {
    id: 1,
    title: 'Home Loan EMI',
    category: 'Loan Commitment',
    amount: 24500,
    dueText: 'Due in 4 days (Nov 23)',
    type: 'loan',
    icon: Landmark,
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  {
    id: 2,
    title: 'Cloud Worksuite Pass',
    category: 'SaaS Subscription',
    amount: 1499,
    dueText: 'Renews in 6 days (Nov 25)',
    type: 'subscription',
    icon: CreditCard,
    badgeColor: 'bg-purple-500/15 text-secondary border-purple-500/30',
  },
  {
    id: 3,
    title: 'Media Streaming Bundle',
    category: 'Entertainment',
    amount: 649,
    dueText: 'Renews in 9 days (Nov 28)',
    type: 'subscription',
    icon: CreditCard,
    badgeColor: 'bg-purple-500/15 text-secondary border-purple-500/30',
  },
  {
    id: 4,
    title: 'Automobile Loan EMI',
    category: 'Vehicle Finance',
    amount: 8200,
    dueText: 'Due in 11 days (Nov 30)',
    type: 'loan',
    icon: Landmark,
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
]

export const UpcomingBillsWidget = () => {
  const totalUpcoming = UPCOMING_BILLS.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-card space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div>
          <h3 className="text-base font-bold text-text-primary tracking-tight">
            Upcoming Commitments
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Next 14 days outgo: ₹{totalUpcoming.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/loans"
            className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Bill Items */}
      <div className="space-y-2.5">
        {UPCOMING_BILLS.map((bill) => {
          const Icon = bill.icon
          return (
            <div
              key={bill.id}
              className="p-3 rounded-xl bg-background/80 border border-border/80 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-text-secondary shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-text-primary truncate">{bill.title}</p>
                  <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-secondary" />
                    <span>{bill.dueText}</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-bold text-text-primary block">
                  ₹{bill.amount.toLocaleString('en-IN')}
                </span>
                <span
                  className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase border ${bill.badgeColor}`}
                >
                  {bill.type}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer link to subscriptions */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
        <span>Advance Reminder Status: <strong>Active</strong></span>
        <Link to="/subscriptions" className="text-secondary hover:underline text-[11px] font-medium">
          Subscriptions Calendar →
        </Link>
      </div>
    </div>
  )
}

export default UpcomingBillsWidget
