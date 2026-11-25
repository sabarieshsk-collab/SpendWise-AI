import React, { useState } from 'react'
import { X, Plus, AlertCircle, PieChart } from 'lucide-react'
import { Button } from '../ui/Button'
import { EXPENSE_CATEGORIES } from '../../context'

export const CreateBudgetModal = ({ isOpen, onClose, onSave, existingCategories }) => {
  const availableCategories = EXPENSE_CATEGORIES.filter(
    (c) => !existingCategories.includes(c)
  )

  const [category, setCategory] = useState(availableCategories[0] || 'Other')
  const [customCategory, setCustomCategory] = useState('')
  const [limit, setLimit] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const targetCategory = category === 'Custom' ? customCategory.trim() : category

    if (!targetCategory) {
      setError('Category name is required.')
      return
    }

    if (existingCategories.map((c) => c.toLowerCase()).includes(targetCategory.toLowerCase())) {
      setError(`A budget envelope for "${targetCategory}" already exists.`)
      return
    }

    const numLimit = parseFloat(limit)
    if (!limit || isNaN(numLimit) || numLimit <= 0) {
      setError('Please enter a valid monthly allocation limit greater than zero.')
      return
    }

    const success = onSave(targetCategory, numLimit)
    if (success !== false) {
      onClose()
    }
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
              <h3 className="text-base font-bold text-text-primary">Create Budget Envelope</h3>
              <p className="text-xs text-text-secondary">Establish a monthly spending limit</p>
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
          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="text-text-secondary font-semibold">Expense Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setError('')
              }}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-sidebar text-text-primary">
                  {cat}
                </option>
              ))}
              <option value="Custom" className="bg-sidebar text-secondary">
                + Add Custom Category
              </option>
            </select>
          </div>

          {/* Custom Category Input if selected */}
          {category === 'Custom' && (
            <div className="space-y-1.5">
              <label className="text-text-secondary font-semibold">Custom Category Name</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => {
                  setCustomCategory(e.target.value)
                  setError('')
                }}
                placeholder="e.g. Pet Care, Gaming, Gym"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>
          )}

          {/* Monthly Allocation Limit */}
          <div className="space-y-1.5">
            <label className="text-text-secondary font-semibold">Monthly Allocation (₹)</label>
            <input
              type="number"
              step="100"
              min="100"
              value={limit}
              onChange={(e) => {
                setLimit(e.target.value)
                setError('')
              }}
              placeholder="e.g. 10000"
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
            />
          </div>

          {error && (
            <p className="text-[11px] text-danger flex items-center gap-1 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <div className="p-3 rounded-xl bg-background border border-border text-[11px] text-text-muted leading-relaxed">
            Automatic threshold alerts will monitor spending at <strong>50%</strong>, <strong>80%</strong>, and <strong>100%</strong>.
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Create Envelope
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBudgetModal
