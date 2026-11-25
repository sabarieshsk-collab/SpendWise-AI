/**
 * Financial formatters for SpendWise AI
 */

export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatPercent = (value, decimals = 1) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export const formatDate = (date, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date))
}
