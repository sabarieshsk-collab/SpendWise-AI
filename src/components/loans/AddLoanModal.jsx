import React, { useState, useEffect } from 'react'
import { X, Landmark, AlertCircle, Calculator } from 'lucide-react'
import { Button } from '../ui/Button'
import { LOAN_TYPES, calculateReducingBalanceEMI } from '../../context'

export const AddLoanModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('')
  const [loanType, setLoanType] = useState(LOAN_TYPES[0] || 'Home Loan')
  const [lender, setLender] = useState('')
  const [principal, setPrincipal] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [tenureMonths, setTenureMonths] = useState('60')
  const [emi, setEmi] = useState('')
  const [nextDueDate, setNextDueDate] = useState('')
  const [autoCalculatedEmi, setAutoCalculatedEmi] = useState(0)
  const [error, setError] = useState('')

  // Dynamically calculate estimated EMI whenever principal, interest rate, or tenure changes
  useEffect(() => {
    const P = parseFloat(principal) || 0
    const r = parseFloat(interestRate) || 0
    const n = parseInt(tenureMonths, 10) || 0
    if (P > 0 && n > 0) {
      const estimated = calculateReducingBalanceEMI(P, r, n)
      setAutoCalculatedEmi(estimated)
    } else {
      setAutoCalculatedEmi(0)
    }
  }, [principal, interestRate, tenureMonths])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Loan account name is required.')
      return
    }

    if (!lender.trim()) {
      setError('Lender / Bank name is required.')
      return
    }

    const numPrincipal = parseFloat(principal)
    if (!principal || isNaN(numPrincipal) || numPrincipal <= 0) {
      setError('Principal amount must be greater than zero.')
      return
    }

    const numRate = interestRate ? parseFloat(interestRate) : 0
    if (isNaN(numRate) || numRate < 0) {
      setError('Interest rate cannot be negative.')
      return
    }

    const numTenure = parseInt(tenureMonths, 10)
    if (!tenureMonths || isNaN(numTenure) || numTenure <= 0) {
      setError('Tenure in months must be a positive integer.')
      return
    }

    if (!nextDueDate) {
      setError('Next EMI due date is required.')
      return
    }

    const finalEmi = emi ? parseFloat(emi) : autoCalculatedEmi

    onSave({
      name: name.trim(),
      loanType,
      lender: lender.trim(),
      principal: numPrincipal,
      interestRate: numRate,
      startDate,
      tenureMonths: numTenure,
      emi: finalEmi,
      nextDueDate,
    })

    // Reset & close
    setName('')
    setLoanType(LOAN_TYPES[0])
    setLender('')
    setPrincipal('')
    setInterestRate('')
    setStartDate(new Date().toISOString().split('T')[0])
    setTenureMonths('60')
    setEmi('')
    setNextDueDate('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-secondary flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Add Loan Facility</h3>
              <p className="text-xs text-text-secondary">Track debt amortization and schedules</p>
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
          {/* Loan Name & Type */}
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
                placeholder="e.g. Primary Home Loan"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Loan Type *</label>
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

          {/* Lender & Principal Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Lender / Financial Institution *</label>
              <input
                type="text"
                value={lender}
                onChange={(e) => {
                  setLender(e.target.value)
                  setError('')
                }}
                placeholder="e.g. HDFC Bank, ICICI Bank"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Principal Borrowed (₹) *</label>
              <input
                type="number"
                step="5000"
                min="1000"
                value={principal}
                onChange={(e) => {
                  setPrincipal(e.target.value)
                  setError('')
                }}
                placeholder="e.g. 500000"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          {/* Annual Interest Rate & Tenure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Annual Interest Rate (%) *</label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={interestRate}
                onChange={(e) => {
                  setInterestRate(e.target.value)
                  setError('')
                }}
                placeholder="e.g. 8.5 (or 0 for zero-interest)"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Tenure (in Months) *</label>
              <input
                type="number"
                min="1"
                max="360"
                value={tenureMonths}
                onChange={(e) => {
                  setTenureMonths(e.target.value)
                  setError('')
                }}
                placeholder="e.g. 60 (5 years)"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          {/* Start Date & Next Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Loan Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Next EMI Due Date *</label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => {
                  setNextDueDate(e.target.value)
                  setError('')
                }}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          {/* Monthly EMI (Custom or Auto-Calculated) */}
          <div className="p-3.5 rounded-xl bg-background border border-border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                <Calculator className="w-3.5 h-3.5 text-secondary" />
                <span>Monthly EMI Calculation</span>
              </div>
              {autoCalculatedEmi > 0 && (
                <span className="text-[11px] font-bold text-success">
                  Est. ₹{autoCalculatedEmi.toLocaleString('en-IN')}/mo
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-text-secondary font-medium">
                  Custom Monthly EMI (Optional, overrides formula)
                </label>
                {autoCalculatedEmi > 0 && (
                  <button
                    type="button"
                    onClick={() => setEmi(autoCalculatedEmi.toString())}
                    className="text-[10px] text-secondary hover:underline"
                  >
                    Use Formula Value
                  </button>
                )}
              </div>
              <input
                type="number"
                step="50"
                min="0"
                value={emi}
                onChange={(e) => setEmi(e.target.value)}
                placeholder={
                  autoCalculatedEmi > 0
                    ? `Auto-calculated: ₹${autoCalculatedEmi}`
                    : 'Enter EMI or leave blank to auto-compute'
                }
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <p className="text-[10px] text-text-muted leading-relaxed">
              * Note: Formula uses reducing-balance amortization [EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)]. Actual bank schedules may differ by small rounding or fee increments.
            </p>
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
              Create Loan Facility
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddLoanModal
