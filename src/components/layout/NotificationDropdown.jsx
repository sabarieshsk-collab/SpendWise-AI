import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCircle2, AlertTriangle, Sparkles, X } from 'lucide-react'

export const NotificationIcon = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const sampleNotifications = [
    {
      id: 1,
      title: 'Smart Budget Alert',
      message: 'You have spent 82% of your Dining budget this month.',
      time: '10m ago',
      type: 'warning',
      icon: AlertTriangle,
    },
    {
      id: 2,
      title: 'AI Insight Available',
      message: 'SpendWise detected a recurring charge increase of $4.99.',
      time: '1h ago',
      type: 'ai',
      icon: Sparkles,
    },
    {
      id: 3,
      title: 'Savings Goal Achieved',
      message: 'Emergency Fund milestone reached 100%!',
      time: '3h ago',
      type: 'success',
      icon: CheckCircle2,
    },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-card border border-border rounded-xl shadow-card z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3.5 border-b border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">Notifications</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary/20 text-secondary">
                3 new
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-border/60 max-h-80 overflow-y-auto">
            {sampleNotifications.map((n) => {
              const Icon = n.icon
              return (
                <div key={n.id} className="p-3.5 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                      n.type === 'warning' ? 'bg-warning/15 text-warning' :
                      n.type === 'ai' ? 'bg-primary/20 text-secondary' : 'bg-success/15 text-success'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-xs font-semibold text-text-primary truncate">{n.title}</p>
                        <span className="text-[10px] text-text-secondary shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-2.5 bg-sidebar/50 border-t border-border/80 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-secondary hover:text-primary transition-colors inline-block"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationIcon
