import React, { useState, useEffect } from 'react'
import { X, Edit3, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import {
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_FREQUENCIES,
  PAYMENT_METHODS,
  calculateMonthlyEquivalent,
} from '../../context'

export const EditSubscriptionModal = ({ isOpen, onClose, onSave, subscription }) => {
  const [name, setName] = useState('')
  const [provider, setProvider] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('Monthly')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [nextRenewalDate, setNextRenewalDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [autoRenewal, setAutoRenewal] = useState(true)
  const [status, setStatus] = useState('Active')
  const [error, setError] = useState('')

  useEffect(() => {
    if (subscription) {
      setName(subscription.name || '')
      setProvider(subscription.provider || '')
      setCategory(subscription.category || SUBSCRIPTION_CATEGORIES[0])
      setAmount(subscription.amount?.toString() || '')
      setFrequency(subscription.frequency || 'Monthly')
      setPaymentMethod(subscription.paymentMethod || PAYMENT_METHODS[3])
      setNextRenewalDate(subscription.nextRenewalDate || '')
      setExpiryDate(subscription.expiryDate || '')
      setAutoRenewal(Boolean(subscription.autoRenewal))
      setStatus(subscription.status || 'Active')
      setError('')
    }
  }, [subscription])

  if (!isOpen || !subscription) return null

  const monthlyEquivalent = calculateMonthlyEquivalent(amount, frequency)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Subscription name is required.')
      return
    }

    if (!provider.trim()) {
      setError('Provider name is required.')
      return
    }

    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be greater than zero.')
      return
    }

    if (!nextRenewalDate) {
      setError('Next renewal date is required.')
      return
    }

    onSave(subscription.id, {
      name: name.trim(),
      provider: provider.trim(),
      category,
      amount: numAmount,
      frequency,
      paymentMethod,
      nextRenewalDate,
      expiryDate,
      autoRenewal: Boolean(autoRenewal),
      status,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-secondary flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Edit Subscription</h3>
              <p className="text-xs text-text-secondary">Update plan terms and renewal</p>
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
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Provider *</label>
              <input
                type="text"
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value)
                  setError('')
                }}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

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

          {amount > 0 && (
            <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between text-xs">
              <span className="text-text-secondary">Monthly Equivalent:</span>
              <span className="font-bold text-secondary">
                ₹{monthlyEquivalent.toLocaleString('en-IN')}/mo
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Next Renewal Date *</label>
              <input
                type="date"
                value={nextRenewalDate}
                onChange={(e) => setNextRenewalDate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Expiry Date (Optional)</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Status</label>
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
                id="editAutoRenewalCheckbox"
                checked={autoRenewal}
                onChange={(e) => setAutoRenewal(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary bg-background border-border"
              />
              <label htmlFor="editAutoRenewalCheckbox" className="text-text-secondary cursor-pointer">
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
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditSubscriptionModal
