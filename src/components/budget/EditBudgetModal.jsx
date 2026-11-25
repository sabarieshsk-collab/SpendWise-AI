import React, { useState, useEffect } from 'react'
import { X, PieChart, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'

export const EditBudgetModal = ({ isOpen, onClose, onSave, category, currentLimit }) => {
  const [limit, setLimit] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setLimit(currentLimit ? currentLimit.toString() : '')
      setError('')
    }
  }, [isOpen, currentLimit])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const num = parseFloat(limit)
    if (!limit || isNaN(num) || num <= 0) {
      setError('Please enter a valid allocation greater than zero.')
      return
    }

    onSave(category, num)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-left">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-secondary flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Adjust Budget Limit</h3>
              <p className="text-xs text-secondary font-medium">{category}</p>
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-text-secondary font-semibold">Monthly Allocation (₹)</label>
            <input
              type="number"
              step="100"
              min="100"
              value={limit}
              onChange={(e) => {
                setLimit(e.target.value)
                if (error) setError('')
              }}
              placeholder="e.g. 15000"
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary/60"
            />
            {error && (
              <p className="text-[11px] text-danger flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3 h-3" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-background border border-border text-[11px] text-text-muted leading-relaxed">
            Automatic threshold alerts will fire at <strong>50%</strong> (progress update), <strong>80%</strong> (spending warning), and <strong>100%</strong> (limit reached).
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Save Allocation
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditBudgetModal
