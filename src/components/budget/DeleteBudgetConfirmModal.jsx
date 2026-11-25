import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../ui/Button'

export const DeleteBudgetConfirmModal = ({ isOpen, onClose, onConfirm, category }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger/15 text-danger flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Delete Budget Envelope</h3>
            <p className="text-xs text-text-secondary">Remove category threshold limits</p>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          Are you sure you want to remove the budget envelope for{' '}
          <strong className="text-text-primary font-semibold">"{category}"</strong>? Transaction records in this category will remain intact in your ledger.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            Delete Envelope
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteBudgetConfirmModal
