import React, { useState } from 'react'
import { X, PlusCircle, AlertCircle, Coins } from 'lucide-react'
import { Button } from '../ui/Button'

export const ContributionModal = ({ isOpen, onClose, onAddContribution, goal }) => {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  if (!isOpen || !goal) return null

  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid deposit amount greater than zero.')
      return
    }

    if (numAmount > remaining) {
      setError(
        `Contribution of ₹${numAmount.toLocaleString('en-IN')} exceeds remaining goal target of ₹${remaining.toLocaleString('en-IN')}. Please deposit at most ₹${remaining.toLocaleString('en-IN')}.`
      )
      return
    }

    onAddContribution(goal.id, {
      amount: numAmount,
      date,
      note: note.trim() || 'Manual savings deposit',
    })

    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setNote('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-left">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-success/15 text-success flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Add Contribution</h3>
              <p className="text-xs text-text-secondary truncate max-w-[200px]">{goal.name}</p>
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

        {/* Goal Status Mini Summary */}
        <div className="p-3 rounded-xl bg-background border border-border flex items-center justify-between text-xs">
          <div>
            <span className="text-text-muted text-[10px] block">Current Progress</span>
            <span className="font-bold text-text-primary">
              ₹{goal.savedAmount.toLocaleString('en-IN')} / ₹{goal.targetAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-text-muted text-[10px] block">Remaining</span>
            <span className="font-bold text-secondary">₹{remaining.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Contribution Amount */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-text-secondary font-semibold">Deposit Amount (₹) *</label>
              <button
                type="button"
                onClick={() => setAmount(remaining.toString())}
                className="text-[10px] text-secondary hover:underline font-medium"
              >
                Max out remaining (₹{remaining.toLocaleString('en-IN')})
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                step="100"
                min="1"
                max={remaining}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError('')
                }}
                placeholder={`e.g. ${Math.min(10000, remaining)}`}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60 font-medium"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-text-secondary font-semibold">Deposit Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-primary/60"
            />
          </div>

          {/* Optional Note */}
          <div className="space-y-1">
            <label className="text-text-secondary font-semibold">Note / Memo (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. November salary savings surplus"
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-text-primary focus:outline-none focus:border-primary/60"
            />
          </div>

          {error && (
            <p className="text-[11px] text-danger flex items-center gap-1.5 mt-1 leading-snug">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Confirm Deposit
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContributionModal
