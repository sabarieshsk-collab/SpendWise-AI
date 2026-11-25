import React from 'react'

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary shadow-sm hover:shadow-glow-primary',
    secondary: 'bg-card text-text-primary border border-border hover:bg-card-hover hover:border-slate-700 focus:ring-primary',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5 focus:ring-primary',
    outline: 'border border-primary/40 text-primary hover:bg-primary/10 focus:ring-primary',
    danger: 'bg-danger text-white hover:bg-red-600 focus:ring-danger shadow-sm',
    success: 'bg-success text-white hover:bg-green-600 focus:ring-success shadow-sm',
  }

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
    icon: 'p-2 rounded-lg',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  )
}

export default Button
