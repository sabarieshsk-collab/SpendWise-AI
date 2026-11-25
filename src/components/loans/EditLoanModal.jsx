import React, { useState, useEffect } from 'react'
import { X, Edit3, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { LOAN_TYPES } from '../../context'

export const EditLoanModal = ({ isOpen, onClose, onSave, loan }) => {
  const [name, setName] = useState('')
  const [loanType, setLoanType] = useState('')
  const [lender, setLender] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [emi, setEmi] = useState('')
  const [nextDueDate, setNextDueDate] = useState('')
  const [balance, setBalance] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (loan) {
      setName(loan.name || '')
      setLoanType(loan.loanType || LOAN_TYPES[0])
      setLender(loan.lender || '')
      setInterestRate(loan.interestRate?.toString() || '0')
      setEmi(loan.emi?.toString() || '')
      setNextDueDate(loan.nextDueDate || '')
      setBalance(loan.balance?.toString() || '')
      setError('')
    }
  }, [loan])

  if (!isOpen || !loan) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Loan name is required.')
      return
    }

    if (!lender.trim()) {
      setError('Lender name is required.')
      return
    }

    const numBal = parseFloat(balance)
    if (isNaN(numBal) || numBal < 0) {
      setError('Outstanding balance cannot be negative.')
      return
    }

    const numEmi = parseFloat(emi)
    if (isNaN(numEmi) || numEmi < 0) {
      setError('EMI cannot be negative.')
      return
    }

    if (!nextDueDate) {
      setError('Next due date is required.')
      return
    }

    onSave(loan.id, {
      name: name.trim(),
      loanType,
      lender: lender.trim(),
      balance: numBal,
      interestRate: parseFloat(interestRate) || 0,
      emi: numEmi,
      nextDueDate,
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
              <h3 className="text-base font-bold text-text-primary">Edit Loan Facility</h3>
              <p className="text-xs text-text-secondary">Update terms and schedule</p>
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
              <label className="text-text-secondary font-semibold">Loan Name *</label>
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
              <label className="text-text-secondary font-semibold">Loan Type</label>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
              >
                {LOAN_TYPES.map((lt) => (
                  <option key={lt} value={lt} className="bg-sidebar text-text-primary">
                    {lt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Lender / Bank *</label>
              <input
                type="text"
                value={lender}
                onChange={(e) => {
                  setLender(e.target.value)
                  setError('')
                }}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Interest Rate (%) *</label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Outstanding Balance (₹) *</label>
              <input
                type="number"
                step="500"
                min="0"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Monthly EMI (₹) *</label>
              <input
                type="number"
                step="50"
                min="0"
                value={emi}
                onChange={(e) => setEmi(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-text-secondary font-semibold">Next EMI Due Date *</label>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-primary/60"
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

export default EditLoanModal
