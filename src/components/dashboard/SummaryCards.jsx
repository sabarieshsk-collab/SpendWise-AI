import React from 'react'
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Landmark,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react'

export const SummaryCards = ({ data }) => {
  const cards = [
    {
      id: 'balance',
      title: 'Total Available Balance',
      amount: data?.balance || '₹2,48,500',
      change: '+14.2%',
      changeType: 'positive',
      changeLabel: 'vs last month',
      subtext: 'Liquid checking & savings pots',
      icon: Wallet,
      iconColor: 'bg-primary/15 text-secondary border-primary/25',
    },
    {
      id: 'income',
      title: 'Monthly Income',
      amount: data?.income || '₹1,20,000',
      change: '+8.5%',
      changeType: 'positive',
      changeLabel: 'vs last month',
      subtext: 'Primary salary & side cashflow',
      icon: ArrowDownLeft,
      iconColor: 'bg-success/15 text-success border-success/25',
    },
    {
      id: 'expenses',
      title: 'Monthly Expenses',
      amount: data?.expenses || '₹48,250',
      change: '-5.2%',
      changeType: 'positive', // Lower expense is good
      changeLabel: 'vs last month',
      subtext: '40.2% consumption ratio',
      icon: ArrowUpRight,
      iconColor: 'bg-warning/15 text-warning border-warning/25',
    },
    {
      id: 'savings',
      title: 'Total Savings',
      amount: data?.savings || '₹71,750',
      change: '+12.8%',
      changeType: 'positive',
      changeLabel: 'vs last month',
      subtext: '59.8% effective retention rate',
      icon: PiggyBank,
      iconColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    },
    {
      id: 'loans',
      title: 'Outstanding Loans',
      amount: data?.loans || '₹4,85,000',
      change: '2 Active',
      changeType: 'neutral',
      changeLabel: 'Home & Auto Loans',
      subtext: 'Next EMI: ₹24,500 due in 4 days',
      icon: Landmark,
      iconColor: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
    },
    {
      id: 'subscriptions',
      title: 'Recurring Expenses',
      amount: data?.subscriptions || '₹12,450',
      change: '8 Services',
      changeType: 'neutral',
      changeLabel: 'Active subscriptions',
      subtext: 'Next renewal: ₹1,499 in 6 days',
      icon: CreditCard,
      iconColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className="rounded-2xl bg-card border border-border p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-200 hover:border-slate-700 hover:shadow-card hover:-translate-y-0.5 group"
          >
            <div>
              {/* Header: Title and Icon */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-text-secondary truncate">
                  {card.title}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${card.iconColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Amount Display */}
              <div className="text-xl font-extrabold tracking-tight text-text-primary">
                {card.amount}
              </div>
            </div>

            {/* Bottom Change Indicator */}
            <div className="pt-2.5 mt-2.5 border-t border-border/60">
              <div className="flex items-center gap-1.5 text-xs">
                {card.changeType === 'positive' ? (
                  <span className="inline-flex items-center text-success font-semibold text-[11px]">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    {card.change}
                  </span>
                ) : card.changeType === 'negative' ? (
                  <span className="inline-flex items-center text-danger font-semibold text-[11px]">
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                    {card.change}
                  </span>
                ) : (
                  <span className="inline-flex items-center text-secondary font-semibold text-[11px]">
                    {card.change}
                  </span>
                )}
                <span className="text-[10px] text-text-muted truncate">
                  {card.changeLabel}
                </span>
              </div>
              <p className="text-[10px] text-text-muted mt-0.5 truncate">{card.subtext}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SummaryCards
