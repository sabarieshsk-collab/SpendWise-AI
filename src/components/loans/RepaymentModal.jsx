import React, { useState } from 'react'
import { X, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react'
import { Button } from '../ui/Button'
import { PAYMENT_METHODS } from '../../context'

export const RepaymentModal = ({ isOpen, onClose, onRecordRepayment, loan }) => {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [method, setMethod] = useState(PAYMENT_METHODS[0] || 'Bank Transfer')
  const [paymentType, setPaymentType] = useState('EMI')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  if (!isOpen || !loan) return null

  const currentBalance = loan.balance || 0
  const isCurrentDueAlreadyPaid = Boolean(
    loan.nextDueDate && Array.isArray(loan.paidDueDates) && loan.paidDueDates.includes(loan.nextDueDate)
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid repayment amount greater than zero.')
      return
    }

    if (numAmount > currentBalance) {
      setError(
        `Repayment amount (₹${numAmount.toLocaleString('en-IN')}) cannot exceed outstanding loan balance (₹${currentBalance.toLocaleString('en-IN')}).`
      )
      return
    }

    onRecordRepayment(loan.id, {
      amount: numAmount,
      date,
      method,
      paymentType,
      notes: notes.trim() || (paymentType === 'EMI' ? 'Installment Payment' : 'Principal Reduction'),
    })

    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setPaymentType('EMI')
    setNotes('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-left">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-success/15 text-success flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Record Loan Repayment</h3>
              <p className="text-xs text-text-secondary truncate max-w-[200px]">{loan.name}</p>
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

        {/* Loan Balance Info Card */}
        <div className="p-3.5 rounded-xl bg-background border border-border flex items-center justify-between text-xs">
          <div>
            <span className="text-text-muted text-[10px] block">Outstanding Balance</span>
            <span className="font-extrabold text-text-primary text-sm">
              ₹{currentBalance.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-text-muted text-[10px] block">Monthly EMI</span>
            <span className="font-bold text-secondary">₹{loan.emi.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Payment Amount */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-text-secondary font-semibold">Repayment Amount (₹) *</label>
              <div className="flex gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => setAmount(Math.min(loan.emi, currentBalance).toString())}
                  className="text-secondary hover:underline"
                >
                  Pay 1 EMI (₹{loan.emi.toLocaleString('en-IN')})
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(currentBalance.toString())}
                  className="text-emerald-400 hover:underline"
                >
                  Full Payoff
                </button>
              </div>
            </div>
            <input
              type="number"
              step="100"
              min="1"
              max={currentBalance}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError('')
              }}
              placeholder={`e.g. ${loan.emi}`}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary/60 font-semibold"
            />
          </div>

          {/* Payment Type Classification */}
          <div className="space-y-1.5">
            <label className="text-text-secondary font-semibold">Repayment Classification *</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-background border border-border text-center">
              <button
                type="button"
                onClick={() => setPaymentType('EMI')}
                className={`py-1.5 px-2 rounded-lg font-semibold transition-all ${
                  paymentType === 'EMI'
                    ? 'bg-primary/20 text-secondary border border-primary/40'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Regular EMI
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('PARTIAL')}
                className={`py-1.5 px-2 rounded-lg font-semibold transition-all ${
                  paymentType === 'PARTIAL'
                    ? 'bg-primary/20 text-secondary border border-primary/40'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Partial Pay
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('PREPAYMENT')}
                className={`py-1.5 px-2 rounded-lg font-semibold transition-all ${
                  paymentType === 'PREPAYMENT'
                    ? 'bg-primary/20 text-secondary border border-primary/40'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Prepayment
              </button>
            </div>
            {isCurrentDueAlreadyPaid && paymentType === 'EMI' && (
              <p className="text-[10px] text-amber-400/90 bg-amber-400/10 p-2 rounded-lg border border-amber-400/20">
                Notice: The EMI for {loan.nextDueDate} is already settled. This entry will be logged as principal reduction without re-advancing the schedule.
              </p>
            )}
            {paymentType === 'EMI' && amount && parseFloat(amount) < Math.min(loan.emi, currentBalance) && (
              <p className="text-[10px] text-text-muted">
                Note: Amount is below regular EMI (₹{loan.emi.toLocaleString('en-IN')}). Will be logged as partial and will not advance the next due date.
              </p>
            )}
          </div>

          {/* Payment Date & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Payment Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-semibold">Payment Method *</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm} className="bg-sidebar text-text-primary">
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-text-secondary font-semibold">Repayment Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Regular monthly installment or lump sum"
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-text-primary focus:outline-none focus:border-primary/60"
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
              Confirm Repayment
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RepaymentModal
