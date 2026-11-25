import React from 'react'
import { NavLink } from 'react-router-dom'
import { Logo } from '../common/Logo'
import UserProfile from './UserProfile'
import { NAVIGATION_ITEMS } from '../../data/navigation'

export const Sidebar = ({ onClose }) => {
  return (
    <aside className="w-64 h-full bg-sidebar border-r border-border flex flex-col justify-between select-none">
      {/* Top Branding Header */}
      <div className="p-5 border-b border-border/80 flex items-center justify-between">
        <Logo showTagline={false} size="default" />
      </div>

      {/* Navigation Links Area */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAVIGATION_ITEMS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="px-3 text-[11px] font-semibold tracking-wider uppercase text-text-muted">
              {section.group}
            </h4>
            <div className="space-y-0.5 mt-2">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-primary/15 text-white border border-primary/30 shadow-sm font-semibold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-primary/20 text-secondary border border-primary/30">
                        {item.badge}
                      </span>
                    )}

                    {item.badgeCount && (
                      <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded-full bg-danger/20 text-danger border border-danger/30">
                        {item.badgeCount}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-border/80 bg-sidebar/80">
        <UserProfile />
      </div>
    </aside>
  )
}

export default Sidebar
