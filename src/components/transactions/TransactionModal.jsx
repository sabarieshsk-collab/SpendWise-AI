import React, { useState, useEffect } from 'react'
import { X, ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../../context'

export const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = 'add', // 'add' | 'edit'
}) => {
  const [type, setType] = useState('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[1]) // UPI
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState(false)

  // Populate data when editing
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setType(initialData.type || 'expense')
      setDescription(initialData.description || '')
      setAmount(initialData.amount ? initialData.amount.toString() : '')
      setCategory(initialData.category || EXPENSE_CATEGORIES[0])
      setDate(initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0])
      setPaymentMethod(initialData.paymentMethod || PAYMENT_METHODS[1])
      setNotes(initialData.notes || '')
    } else {
      // Reset form
      setType('expense')
      setDescription('')
      setAmount('')
      setCategory(EXPENSE_CATEGORIES[0])
      setDate(new Date().toISOString().split('T')[0])
      setPaymentMethod(PAYMENT_METHODS[1])
      setNotes('')
    }
    setErrors({})
    setTouched(false)
  }, [initialData, mode, isOpen])

  // When type changes, ensure category matches the selected type
  const handleTypeChange = (newType) => {
    setType(newType)
    if (newType === 'income') {
      if (!INCOME_CATEGORIES.includes(category)) {
        setCategory(INCOME_CATEGORIES[0])
      }
    } else {
      if (!EXPENSE_CATEGORIES.includes(category)) {
        setCategory(EXPENSE_CATEGORIES[0])
      }
    }
  }

  if (!isOpen) return null

  const validate = () => {
    const errs = {}
    if (!description.trim()) {
      errs.description = 'Description or merchant name is required.'
    } else if (description.trim().length < 2) {
      errs.description = 'Description must be at least 2 characters.'
    }

    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount)) {
      errs.amount = 'Amount is required.'
    } else if (numAmount <= 0) {
      errs.amount = 'Amount must be greater than zero.'
    }

    if (!date) {
      errs.date = 'Valid date is required.'
    }

    // Verify category matches type
    const validCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    if (!validCategories.includes(category)) {
      errs.category = `Category must be a valid ${type} category.`
    }

    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    const errs = validate()
    setErrors(errs)

    if (Object.keys(errs).length > 0) return

    const transactionPayload = {
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date,
      paymentMethod,
      notes: notes.trim(),
    }

    onSubmit(transactionPayload)
    onClose()
  }

  const currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {mode === 'edit' ? 'Edit Transaction' : 'Record New Transaction'}
            </h3>
            <p className="text-xs text-text-secondary">
              Update your shared demonstration financial ledger
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
          {/* Type Selector (Expense vs Income) */}
          <div className="space-y-1.5">
            <label className="text-text-secondary font-semibold">Transaction Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  type === 'expense'
                    ? 'bg-warning/15 text-warning border border-warning/40 shadow-sm'
                    : 'bg-background border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Expense Outlay</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  type === 'income'
                    ? 'bg-success/15 text-success border border-success/40 shadow-sm'
                    : 'bg-background border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Income Inflow</span>
              </button>
            </div>
          </div>

          {/* Description / Merchant */}
          <div className="space-y-1">
            <label className="text-text-secondary font-semibold">Description / Merchant *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) setErrors((prev) => ({ ...prev, description: null }))
              }}
              placeholder="e.g. Fresh Groceries, TechCorp Salary, Netflix"
              className={`w-full bg-background border rounded-xl px-3.5 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none transition-colors ${
                touched && errors.description
                  ? 'border-danger focus:ring-1 focus:ring-danger'
                  : 'border-border focus:border-primary/60'
              }`}
            />
            {touched && errors.description && (
              <p className="text-[11px] text-danger flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Amount & Date in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Amount */}
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Amount (₹) *</label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: null }))
                }}
                placeholder="e.g. 2500"
                className={`w-full bg-background border rounded-xl px-3.5 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none transition-colors ${
                  touched && errors.amount
                    ? 'border-danger focus:ring-1 focus:ring-danger'
                    : 'border-border focus:border-primary/60'
                }`}
              />
              {touched && errors.amount && (
                <p className="text-[11px] text-danger flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.amount}</span>
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Transaction Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          {/* Category & Payment Method in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">
                Category ({type === 'income' ? 'Income' : 'Expense'}) *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
              >
                {currentCategories.map((cat) => (
                  <option key={cat} value={cat} className="bg-sidebar text-text-primary">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm} className="bg-sidebar text-text-primary">
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1">
            <label className="text-text-secondary font-semibold">Optional Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add memo, invoice number, or location details..."
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              {mode === 'edit' ? 'Update Transaction' : 'Save Transaction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TransactionModal
