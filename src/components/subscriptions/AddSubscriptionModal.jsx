import React, { useState } from 'react'
import { X, CreditCard, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '../ui/Button'
import {
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_FREQUENCIES,
  PAYMENT_METHODS,
  calculateMonthlyEquivalent,
} from '../../context'

export const AddSubscriptionModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('')
  const [provider, setProvider] = useState('')
  const [category, setCategory] = useState(SUBSCRIPTION_CATEGORIES[0] || 'Entertainment')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('Monthly')
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[3] || 'Credit Card')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [nextRenewalDate, setNextRenewalDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [autoRenewal, setAutoRenewal] = useState(true)
  const [status, setStatus] = useState('Active')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const monthlyEquivalent = calculateMonthlyEquivalent(amount, frequency)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Subscription name is required.')
      return
    }

    if (!provider.trim()) {
      setError('Service provider or platform is required.')
      return
    }

    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Subscription fee must be greater than zero.')
      return
    }

    if (!nextRenewalDate) {
      setError('Next renewal date is required.')
      return
    }

    onSave({
      name: name.trim(),
      provider: provider.trim(),
      category,
      amount: numAmount,
      frequency,
      paymentMethod,
      startDate,
      nextRenewalDate,
      expiryDate: expiryDate || '',
      autoRenewal: Boolean(autoRenewal),
      status,
    })

    // Reset & close
    setName('')
    setProvider('')
    setCategory(SUBSCRIPTION_CATEGORIES[0])
    setAmount('')
    setFrequency('Monthly')
    setPaymentMethod(PAYMENT_METHODS[3] || 'Credit Card')
    setStartDate(new Date().toISOString().split('T')[0])
    setNextRenewalDate('')
    setExpiryDate('')
    setAutoRenewal(true)
    setStatus('Active')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-secondary flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Add Subscription</h3>
              <p className="text-xs text-text-secondary">Register recurring membership or tool</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Subscription Name & Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Service Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                placeholder="e.g. Netflix, Spotify, GitHub Co-Pilot"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Service Provider *</label>
              <input
                type="text"
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value)
                  setError('')
                }}
                placeholder="e.g. Netflix Inc., Microsoft, Apple"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
              >
                {SUBSCRIPTION_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-sidebar text-text-primary">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm} className="bg-sidebar text-text-primary">
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Billing Amount & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Billed Amount (₹) *</label>
              <input
                type="number"
                step="50"
                min="1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError('')
                }}
                placeholder="e.g. 649"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Billing Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
              >
                {SUBSCRIPTION_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq} className="bg-sidebar text-text-primary">
                    {freq}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Monthly Equivalent Preview Banner */}
          {amount > 0 && (
            <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between text-xs">
              <span className="text-text-secondary">Normalized Monthly Impact:</span>
              <span className="font-bold text-secondary">
                ₹{monthlyEquivalent.toLocaleString('en-IN')}/month
              </span>
            </div>
          )}

          {/* Start Date, Next Renewal Date & Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-2.5 py-2 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Next Renewal *</label>
              <input
                type="date"
                value={nextRenewalDate}
                onChange={(e) => {
                  setNextRenewalDate(e.target.value)
                  setError('')
                }}
                className="w-full bg-background border border-border rounded-xl px-2.5 py-2 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Expiry Date (Optional)</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-2.5 py-2 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          {/* Status & Auto-Renewal Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="autoRenewalCheckbox"
                checked={autoRenewal}
                onChange={(e) => setAutoRenewal(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary bg-background border-border"
              />
              <label htmlFor="autoRenewalCheckbox" className="text-text-secondary cursor-pointer">
                Auto-Renewal Enabled
              </label>
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-danger flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Add Subscription
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddSubscriptionModal
