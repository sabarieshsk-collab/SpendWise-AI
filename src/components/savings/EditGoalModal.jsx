import React, { useState, useEffect } from 'react'
import { X, Edit3, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { SAVINGS_CATEGORIES } from '../../context'

export const EditGoalModal = ({ isOpen, onClose, onSave, goal }) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (goal) {
      setName(goal.name || '')
      setCategory(goal.category || SAVINGS_CATEGORIES[0])
      setTargetAmount(goal.targetAmount?.toString() || '')
      setTargetDate(goal.targetDate || '')
      setDescription(goal.description || '')
      setError('')
    }
  }, [goal])

  if (!isOpen || !goal) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Goal name is required.')
      return
    }

    const target = parseFloat(targetAmount)
    if (!targetAmount || isNaN(target) || target <= 0) {
      setError('Target amount must be a valid number greater than zero.')
      return
    }

    if (target < goal.savedAmount) {
      setError(
        `Target amount (₹${target.toLocaleString('en-IN')}) cannot be less than already saved funds (₹${goal.savedAmount.toLocaleString('en-IN')}).`
      )
      return
    }

    if (!targetDate) {
      setError('Target date is required.')
      return
    }

    onSave(goal.id, {
      name: name.trim(),
      category,
      targetAmount: target,
      targetDate,
      description: description.trim(),
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-left">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-secondary flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Edit Savings Goal</h3>
              <p className="text-xs text-text-secondary">Update target milestone criteria</p>
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
          <div className="space-y-1">
            <label className="text-text-secondary font-semibold">Goal Name *</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
              >
                {SAVINGS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-sidebar text-text-primary">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Target Milestone Date *</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => {
                  setTargetDate(e.target.value)
                  setError('')
                }}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-text-secondary font-semibold">Target Amount (₹) *</label>
            <input
              type="number"
              step="500"
              min={goal.savedAmount}
              value={targetAmount}
              onChange={(e) => {
                setTargetAmount(e.target.value)
                setError('')
              }}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
            />
            <span className="text-[10px] text-text-muted">
              Current saved: ₹{goal.savedAmount.toLocaleString('en-IN')}. New target cannot be below this.
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-text-secondary font-semibold">Description / Purpose</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:outline-none focus:border-primary/60 resize-none"
            />
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

export default EditGoalModal
