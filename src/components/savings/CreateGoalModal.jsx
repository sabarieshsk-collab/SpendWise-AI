import React, { useState } from 'react'
import { X, Target, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { SAVINGS_CATEGORIES } from '../../context'

export const CreateGoalModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(SAVINGS_CATEGORIES[0] || 'Emergency Fund')
  const [targetAmount, setTargetAmount] = useState('')
  const [initialSavedAmount, setInitialSavedAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

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

    const initial = initialSavedAmount ? parseFloat(initialSavedAmount) : 0
    if (isNaN(initial) || initial < 0) {
      setError('Initial saved amount cannot be negative.')
      return
    }

    if (initial > target) {
      setError('Initial saved amount cannot exceed the target amount.')
      return
    }

    if (!targetDate) {
      setError('Target milestone date is required.')
      return
    }

    onSave({
      name: name.trim(),
      category,
      targetAmount: target,
      initialSavedAmount: initial,
      targetDate,
      description: description.trim(),
    })

    // Reset form & close
    setName('')
    setCategory(SAVINGS_CATEGORIES[0] || 'Emergency Fund')
    setTargetAmount('')
    setInitialSavedAmount('')
    setTargetDate('')
    setDescription('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-left">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-secondary flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Create Savings Goal</h3>
              <p className="text-xs text-text-secondary">Set a target milestone with automated tracking</p>
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
          {/* Goal Name */}
          <div className="space-y-1">
            <label className="text-text-secondary font-semibold">Goal Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              placeholder="e.g. Dream Vacation to Tokyo, Tech Fund"
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
            />
          </div>

          {/* Category & Target Date */}
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

          {/* Target Amount & Initial Saved Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Target Amount (₹) *</label>
              <input
                type="number"
                step="500"
                min="1"
                value={targetAmount}
                onChange={(e) => {
                  setTargetAmount(e.target.value)
                  setError('')
                }}
                placeholder="e.g. 150000"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Initial Saved Amount (₹)</label>
              <input
                type="number"
                step="500"
                min="0"
                value={initialSavedAmount}
                onChange={(e) => {
                  setInitialSavedAmount(e.target.value)
                  setError('')
                }}
                placeholder="Optional, e.g. 25000"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          {/* Description / Notes */}
          <div className="space-y-1">
            <label className="text-text-secondary font-semibold">Description / Purpose</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this goal for? (e.g. flight tickets, equipment purchase)"
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
              Create Goal
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateGoalModal
