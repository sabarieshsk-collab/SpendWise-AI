import React, { useState } from 'react'
import { X, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { Button } from '../ui/Button'

export const AddTransactionModal = ({ isOpen, onClose, onAdd }) => {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Food & Dining')
  const [account, setAccount] = useState('Credit Card •••• 4291')
  const [successNotice, setSuccessNotice] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amount || !description) return

    const newTx = {
      id: `tx-${Date.now()}`,
      description: description.trim(),
      category,
      type,
      amount: parseFloat(amount),
      date: 'Just now (Demo)',
      account,
    }

    onAdd(newTx)
    setSuccessNotice(true)
    setTimeout(() => {
      setSuccessNotice(false)
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-text-primary">Record New Transaction</h3>
            <p className="text-xs text-text-secondary">Interactive Demonstration Mode</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successNotice ? (
          <div className="py-8 text-center space-y-2 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-text-primary">Transaction Added (Demo)</h4>
            <p className="text-xs text-text-secondary">Dashboard totals updated in demonstration memory.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  type === 'expense'
                    ? 'bg-warning/15 text-warning border border-warning/40'
                    : 'bg-background border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  type === 'income'
                    ? 'bg-success/15 text-success border border-success/40'
                    : 'bg-background border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Income</span>
              </button>
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="text-text-secondary font-medium">Amount (₹)</label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60"
              />
            </div>

            {/* Description / Merchant */}
            <div className="space-y-1">
              <label className="text-text-secondary font-medium">Description / Merchant</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Starbucks Coffee or Client Payment"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-text-secondary font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
              >
                <option value="Food & Dining">Food & Dining</option>
                <option value="Groceries & Household">Groceries & Household</option>
                <option value="Shopping & Apparel">Shopping & Apparel</option>
                <option value="Utilities & Bills">Utilities & Bills</option>
                <option value="Salary & Earnings">Salary & Earnings</option>
                <option value="Consulting & Freelance">Consulting & Freelance</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>

            {/* Account */}
            <div className="space-y-1">
              <label className="text-text-secondary font-medium">Payment Account</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
              >
                <option value="Credit Card •••• 4291">Credit Card •••• 4291</option>
                <option value="HDFC Priority A/c">HDFC Priority A/c</option>
                <option value="ICICI Bank A/c">ICICI Bank A/c</option>
                <option value="UPI - GPay">UPI - GPay</option>
              </select>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Transaction (Demo)
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default AddTransactionModal
