import React, { useState } from 'react'
import {
  Landmark,
  Plus,
  CreditCard,
  Calendar,
  Trash2,
  Edit3,
  Percent,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  BadgeAlert,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useFinance } from '../context'
import AddLoanModal from '../components/loans/AddLoanModal'
import RepaymentModal from '../components/loans/RepaymentModal'
import EditLoanModal from '../components/loans/EditLoanModal'
import DeleteLoanConfirmModal from '../components/loans/DeleteLoanConfirmModal'
import LoanAnalyticsCharts from '../components/loans/LoanAnalyticsCharts'

export const Loans = () => {
  const {
    loans,
    metrics,
    addLoan,
    updateLoan,
    deleteLoan,
    addLoanRepayment,
  } = useFinance()

  const {
    totalLoanPrincipal,
    totalLoanOutstanding,
    monthlyEMICommitment,
    totalAmountRepaid,
  } = metrics

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [repaymentTargetLoan, setRepaymentTargetLoan] = useState(null)
  const [editingLoan, setEditingLoan] = useState(null)
  const [deletingLoan, setDeletingLoan] = useState(null)
  const [expandedLoanHistory, setExpandedLoanHistory] = useState(null)

  const handleDeleteConfirm = () => {
    if (deletingLoan) {
      deleteLoan(deletingLoan.id)
      setDeletingLoan(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10 text-left">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-secondary border border-primary/30 uppercase tracking-wider">
              Sample Data
            </span>
            <span className="text-xs text-text-muted hidden sm:inline">
              • Reducing-Balance Amortization Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Loan Manager
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Monitor outstanding loans, EMI schedules and repayment progress.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            icon={Plus}
            iconPosition="left"
            className="text-xs font-semibold shadow-sm hover:shadow-glow-primary"
          >
            Add Loan
          </Button>
        </div>
      </div>

      {/* 2. Dynamic KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Loan Principal */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Total Principal Borrowed</span>
            <span className="p-1 rounded-md bg-primary/15 text-secondary">
              <Landmark className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-text-primary tracking-tight">
            ₹{totalLoanPrincipal.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Original debt across {loans.length} facilities</p>
        </div>

        {/* Outstanding Balance */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Outstanding Balance</span>
            <span className="p-1 rounded-md bg-danger/15 text-danger">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-danger tracking-tight">
            ₹{totalLoanOutstanding.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Total current liability remaining</p>
        </div>

        {/* Monthly EMI Commitment */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Monthly EMI Commitment</span>
            <span className="p-1 rounded-md bg-warning/15 text-warning">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-warning tracking-tight">
            ₹{monthlyEMICommitment.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Active recurring monthly installments</p>
        </div>

        {/* Total Amount Repaid */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Total Amount Repaid</span>
            <span className="p-1 rounded-md bg-success/15 text-success">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-success tracking-tight">
            ₹{totalAmountRepaid.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Principal paid down + recorded payments</p>
        </div>
      </div>

      {/* 3. Recharts Analytics */}
      {loans.length > 0 && <LoanAnalyticsCharts loans={loans} />}

      {/* 4. Active Loans Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Loan Facilities ({loans.length})
            </h2>
            <span className="text-xs text-text-muted hidden sm:inline">
              • Deterministic Reducing-Balance EMI & Repayment Tracking
            </span>
          </div>
          <span className="text-xs text-text-muted">
            Repayments strictly reduce outstanding balance
          </span>
        </div>

        {loans.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
            <Landmark className="w-12 h-12 text-text-muted mx-auto opacity-50" />
            <h3 className="text-base font-bold text-text-primary">No active loans found</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              You are completely debt-free! Or add an existing mortgage, auto loan, or personal line to track amortization.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAddModalOpen(true)}
              icon={Plus}
            >
              Add First Loan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loans.map((loan) => {
              const repaidPrincipal = Math.max(0, loan.principal - loan.balance)
              const percentRepaid =
                loan.principal > 0
                  ? Math.min(100, Math.round((repaidPrincipal / loan.principal) * 100))
                  : 0
              const isPaidOff = loan.balance <= 0
              const isExpanded = expandedLoanHistory === loan.id

              return (
                <div
                  key={loan.id}
                  className="rounded-2xl bg-card border border-border p-5 shadow-card flex flex-col justify-between hover:border-slate-700 transition-all duration-200 group text-left"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger border border-danger/20 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-text-primary text-sm sm:text-base tracking-tight">
                              {loan.name}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                isPaidOff
                                  ? 'text-success bg-success/10 border-success/30'
                                  : 'text-secondary bg-primary/10 border-primary/20'
                              }`}
                            >
                              {isPaidOff ? 'Paid Off 🎉' : loan.loanType}
                            </span>
                          </div>
                          <span className="text-xs text-text-muted">
                            Lender: {loan.lender} • Started {loan.startDate}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingLoan(loan)}
                          title="Edit Loan"
                          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingLoan(loan)}
                          title="Delete Loan"
                          className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Financial Terms Badge Row */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-background border border-border text-center text-xs my-2.5">
                      <div>
                        <span className="text-text-muted text-[10px] block">Interest Rate</span>
                        <span className="font-bold text-text-primary">{loan.interestRate}% p.a.</span>
                      </div>
                      <div>
                        <span className="text-text-muted text-[10px] block">Tenure</span>
                        <span className="font-bold text-text-primary">{loan.tenureMonths} mos</span>
                      </div>
                      <div>
                        <span className="text-text-muted text-[10px] block">Monthly EMI</span>
                        <span className="font-bold text-warning">₹{loan.emi.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Balance vs Principal */}
                    <div className="flex items-baseline justify-between my-2 text-xs">
                      <div>
                        <span className="text-text-muted text-[10px] block">Outstanding Debt</span>
                        <span className="text-xl font-extrabold text-danger">
                          ₹{loan.balance.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-text-muted text-[10px] block">Original Principal</span>
                        <span className="text-sm font-bold text-text-primary">
                          ₹{loan.principal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Repayment Progress Bar */}
                    <div className="w-full bg-border rounded-full h-2.5 overflow-hidden my-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPaidOff ? 'bg-emerald-400' : 'bg-success'
                        }`}
                        style={{ width: `${percentRepaid}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-muted">
                      <span>{percentRepaid}% Principal Paid Off</span>
                      <span>₹{repaidPrincipal.toLocaleString('en-IN')} Repaid</span>
                    </div>

                    {/* Due Date Indicator */}
                    <div className="mt-3 p-2.5 rounded-xl bg-background/80 border border-border flex items-center justify-between text-xs text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-text-muted" />
                        <span>Next Due Date:</span>
                      </div>
                      <span className="font-semibold text-text-primary">
                        {isPaidOff ? 'No Dues Pending' : loan.nextDueDate}
                      </span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3.5 mt-3.5 border-t border-border/70 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedLoanHistory(isExpanded ? null : loan.id)
                        }
                        className="text-[11px] text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
                      >
                        <span>
                          {(loan.repayments || []).length} payment records
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isPaidOff}
                        onClick={() => setRepaymentTargetLoan(loan)}
                        icon={CreditCard}
                        iconPosition="left"
                        className="text-xs font-semibold"
                      >
                        {isPaidOff ? 'Closed' : 'Record Repayment'}
                      </Button>
                    </div>

                    {/* Expanded Repayment History */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-border/50 space-y-1.5 text-xs animate-in fade-in duration-150">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          Payment Ledger
                        </p>
                        {(loan.repayments || []).length === 0 ? (
                          <p className="text-[11px] text-text-muted italic">No repayments recorded yet.</p>
                        ) : (
                          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                            {loan.repayments.map((r) => (
                              <div
                                key={r.id}
                                className="p-2 rounded-lg bg-background border border-border flex items-center justify-between text-[11px]"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-success">
                                      ₹{r.amount.toLocaleString('en-IN')}
                                    </span>
                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                                      r.paymentType === 'EMI'
                                        ? 'bg-primary/10 text-secondary border-primary/20'
                                        : r.paymentType === 'PREPAYMENT'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}>
                                      {r.paymentType || 'EMI'}
                                    </span>
                                  </div>
                                  <span className="text-text-muted text-[10px]">
                                    via {r.method}{r.paidDueDate ? ` • Due: ${r.paidDueDate}` : ''}
                                  </span>
                                  {r.notes && (
                                    <span className="text-text-muted text-[10px] block truncate max-w-[180px]">
                                      {r.notes}
                                    </span>
                                  )}
                                </div>
                                <span className="text-text-muted text-[10px] shrink-0">{r.date}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Loan Modal */}
      <AddLoanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addLoan}
      />

      {/* Record Repayment Modal */}
      <RepaymentModal
        isOpen={Boolean(repaymentTargetLoan)}
        onClose={() => setRepaymentTargetLoan(null)}
        onRecordRepayment={addLoanRepayment}
        loan={repaymentTargetLoan}
      />

      {/* Edit Loan Modal */}
      <EditLoanModal
        isOpen={Boolean(editingLoan)}
        onClose={() => setEditingLoan(null)}
        onSave={updateLoan}
        loan={editingLoan}
      />

      {/* Delete Loan Confirm Modal */}
      <DeleteLoanConfirmModal
        isOpen={Boolean(deletingLoan)}
        onClose={() => setDeletingLoan(null)}
        onConfirm={handleDeleteConfirm}
        loan={deletingLoan}
      />
    </div>
  )
}

export default Loans
