import React from 'react'
import { Link } from 'react-router-dom'

export const BrandIcon = ({ size = 38, className = '' }) => {
  return (
    <div 
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary via-indigo-600 to-sidebar shadow-lg shadow-primary/20 p-2 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-white"
      >
        {/* Wallet / Vault outer base */}
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="opacity-90"
        />
        {/* Financial Growth Graph Path */}
        <path
          d="M7 14L10 11L13 13L17 8.5"
          stroke="#F8FAFC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Arrow head for growth */}
        <path
          d="M14.5 8.5H17V11"
          stroke="#F8FAFC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* AI Sparkle / Intelligence Node */}
        <circle cx="17" cy="8.5" r="1.5" fill="#A78BFA" />
      </svg>
      {/* Subtle AI Glow Indicator */}
      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
      </span>
    </div>
  )
}

export const Logo = ({ showTagline = false, size = 'default', to = '/dashboard' }) => {
  const iconSize = size === 'sm' ? 30 : size === 'lg' ? 44 : 36
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'

  const content = (
    <div className="flex items-center gap-3 group select-none">
      <BrandIcon size={iconSize} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tracking-tight text-text-primary ${textSize}`}>
            Spend<span className="text-secondary">Wise</span>
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-primary/20 text-secondary border border-primary/30">
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium text-text-secondary tracking-wide">
            Smart Money. Smarter Decisions.
          </span>
        )}
      </div>
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="transition-opacity hover:opacity-90 inline-flex">
        {content}
      </Link>
    )
  }

  return content
}

export default Logo
