import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, LogOut, ChevronUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const UserProfile = ({ compact = false, showStatus = true }) => {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  const displayName = user?.fullName || 'User Profile'
  const displayEmail = user?.email || 'user@spendwise.ai'

  // Generate initials
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SW'

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <div className="relative" ref={menuRef}>
      <div
        onClick={() => setMenuOpen((prev) => !prev)}
        className={`flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-white/5 cursor-pointer ${
          compact ? 'justify-center' : ''
        }`}
      >
        {/* Avatar with subtle purple gradient ring */}
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-xs text-white shadow-sm ring-2 ring-primary/30">
            {initials}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-sidebar"></span>
        </div>

        {!compact && (
          <div className="flex flex-col text-left overflow-hidden min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-sm font-semibold text-text-primary truncate">
                {displayName}
              </span>
              <ChevronUp
                className={`w-3.5 h-3.5 text-text-muted transition-transform ${
                  menuOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary truncate">{displayEmail}</span>
              {showStatus && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-semibold text-secondary bg-primary/20 rounded border border-primary/30 shrink-0">
                  <Sparkles className="w-2.5 h-2.5" />
                  MEMBER
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-card border border-border rounded-xl shadow-xl z-50 backdrop-blur-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-3 py-2 border-b border-border/60">
            <p className="text-xs font-semibold text-text-primary truncate">{displayName}</p>
            <p className="text-[11px] text-text-muted truncate">{displayEmail}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default UserProfile
