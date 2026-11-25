import React from 'react'
import { Calendar, Plus, Sparkles, Filter, ChevronDown } from 'lucide-react'
import { Button } from '../ui/Button'

export const DashboardHeader = ({
  selectedMonth,
  onMonthChange,
  availableMonths,
  onAddTransaction,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-border/80">
      {/* Title & Greeting */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-secondary border border-primary/30 uppercase tracking-wider">
            Sample Demonstration Data
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-text-muted">
            <Sparkles className="w-3 h-3 text-secondary" />
            AI Co-Pilot Active
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
          Financial Overview
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
          Welcome back! Here's what's happening with your finances.
        </p>
      </div>

      {/* Actions: Month Selector, Reporting Period & Add Transaction */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Month Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="appearance-none bg-card border border-border rounded-xl pl-9 pr-9 py-2 text-xs font-semibold text-text-primary hover:border-slate-700 focus:outline-none focus:border-primary/60 transition-colors cursor-pointer"
          >
            {availableMonths.map((m) => (
              <option key={m.id} value={m.id} className="bg-sidebar text-text-primary">
                {m.label} ({m.period})
              </option>
            ))}
          </select>
          <Calendar className="w-4 h-4 text-text-muted absolute left-3 top-2.5 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Add Transaction Button */}
        <Button
          variant="primary"
          size="md"
          onClick={onAddTransaction}
          icon={Plus}
          iconPosition="left"
          className="shadow-sm hover:shadow-glow-primary text-xs font-semibold"
        >
          Add Transaction
        </Button>
      </div>
    </div>
  )
}

export default DashboardHeader
