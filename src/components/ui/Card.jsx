import React from 'react'

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  headerBorder = true,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`bg-card border border-border rounded-xl shadow-card transition-all duration-200 ${
        hoverable ? 'hover:border-slate-700 hover:shadow-soft hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className={`p-5 flex items-center justify-between ${headerBorder ? 'border-b border-border/80' : ''}`}>
          <div>
            {title && <h3 className="text-base font-semibold text-text-primary tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

export default Card
