import React from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { Button } from '../ui/Button'

export const DeleteGoalConfirmModal = ({ isOpen, onClose, onConfirm, goal }) => {
  if (!isOpen || !goal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-left">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-danger/15 text-danger flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Delete Savings Goal</h3>
              <p className="text-xs text-text-secondary">Confirm milestone removal</p>
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

        <div className="p-3.5 rounded-xl bg-background border border-border space-y-1.5 text-xs">
          <div className="flex items-center justify-between font-semibold text-text-primary">
            <span>{goal.name}</span>
            <span className="text-secondary">₹{goal.savedAmount.toLocaleString('en-IN')} saved</span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Target: ₹{goal.targetAmount.toLocaleString('en-IN')} by {goal.targetDate}
          </p>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          Are you sure you want to delete this savings goal? This will remove the tracking target and its contribution logs from demonstration calculations.
        </p>

        <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Keep Goal
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            icon={Trash2}
            iconPosition="left"
            onClick={onConfirm}
          >
            Delete Goal
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteGoalConfirmModal
