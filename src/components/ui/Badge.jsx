import React from 'react'

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variants = {
    default: 'bg-slate-800 text-text-secondary border-slate-700',
    primary: 'bg-primary/15 text-secondary border-primary/30',
    success: 'bg-success/15 text-success border-success/30',
    warning: 'bg-warning/15 text-warning border-warning/30',
    danger: 'bg-danger/15 text-danger border-danger/30',
  }

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            variant === 'primary' ? 'bg-primary' :
            variant === 'success' ? 'bg-success' :
            variant === 'warning' ? 'bg-warning' :
            variant === 'danger' ? 'bg-danger' : 'bg-slate-400'
          }`}
        />
      )}
      {children}
    </span>
  )
}

export default Badge
