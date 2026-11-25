import React from 'react'
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  Hash,
  Edit2,
  Trash2,
} from 'lucide-react'
import { Button } from '../ui/Button'

export const TransactionDetailModal = ({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !transaction) return null

  const isIncome = transaction.type === 'income'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-left">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                isIncome
                  ? 'bg-success/15 text-success border-success/30'
                  : 'bg-warning/15 text-warning border-warning/30'
              }`}
            >
              {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Transaction Details</h3>
              <span className="text-[10px] text-text-muted">Ledger Verification Entry</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Description Hero */}
        <div className="p-4 rounded-xl bg-background/80 border border-border text-center space-y-1">
          <span className="text-xs text-text-muted capitalize block">
            {transaction.type} Transaction
          </span>
          <div
            className={`text-3xl font-extrabold tracking-tight ${
              isIncome ? 'text-success' : 'text-text-primary'
            }`}
          >
            {isIncome ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
          </div>
          <p className="text-sm font-semibold text-text-primary pt-1">{transaction.description}</p>
        </div>

        {/* Detailed Grid Attributes */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-border/60">
            <span className="text-text-muted flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Category
            </span>
            <span className="font-semibold text-secondary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              {transaction.category}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-border/60">
            <span className="text-text-muted flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Date
            </span>
            <span className="font-semibold text-text-primary">{transaction.date}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-border/60">
            <span className="text-text-muted flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Payment Method
            </span>
            <span className="font-semibold text-text-primary">{transaction.paymentMethod || 'UPI'}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-border/60">
            <span className="text-text-muted flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" /> Transaction ID
            </span>
            <span className="font-mono text-[11px] text-text-muted">{transaction.id}</span>
          </div>

          {transaction.notes && (
            <div className="py-1.5 space-y-1">
              <span className="text-text-muted flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Memo / Notes
              </span>
              <p className="p-2.5 rounded-lg bg-background border border-border text-text-secondary text-xs leading-relaxed">
                {transaction.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onClose()
              onDelete(transaction)
            }}
            icon={Trash2}
            iconPosition="left"
          >
            Delete
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose()
                onEdit(transaction)
              }}
              icon={Edit2}
              iconPosition="left"
            >
              Edit Transaction
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionDetailModal
