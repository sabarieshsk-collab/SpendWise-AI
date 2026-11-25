import React from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, Search, Sparkles } from 'lucide-react'
import NotificationIcon from './NotificationDropdown'

const ROUTE_NAMES = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budget': 'Budget Planner',
  '/savings': 'Savings Goals',
  '/loans': 'Loan Manager',
  '/subscriptions': 'Subscription Manager',
  '/ai-assistant': 'AI Financial Assistant',
  '/ai-financial-assistant': 'AI Financial Assistant',
  '/spending-analyzer': 'AI Spending Analyzer',
  '/ai-spending-analyzer': 'AI Spending Analyzer',
  '/reports': 'Financial Reports',
  '/notifications': 'Notifications',
  '/automation': 'Automation Center',
  '/settings': 'Settings',
}

export const TopNavbar = ({ onOpenMobileMenu }) => {
  const location = useLocation()
  const pageTitle = ROUTE_NAMES[location.pathname] || 'Financial Overview'

  return (
    <header className="h-16 bg-sidebar/80 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted hidden sm:inline">SpendWise AI /</span>
            <h1 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
              {pageTitle}
            </h1>
          </div>
        </div>
      </div>

      {/* Center / Right: Quick Search, AI Status, Notifications */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Search */}
        <div className="hidden lg:flex items-center relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search transactions, budgets, insights..."
            readOnly
            className="w-64 bg-card/80 border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-white/5 rounded border border-border">
            ⌘K
          </kbd>
        </div>

        {/* AI Engine Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-secondary text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
          <span>AI Engine Active</span>
        </div>

        {/* Notification Icon */}
        <NotificationIcon />
      </div>
    </header>
  )
}

export default TopNavbar
