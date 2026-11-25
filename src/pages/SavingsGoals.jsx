import React, { useState } from 'react'
import {
  PiggyBank,
  Target,
  Plus,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Trash2,
  Edit3,
  PlusCircle,
  Clock,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  Laptop,
  GraduationCap,
  Plane,
  Car,
  Home,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useFinance, SAVINGS_CATEGORIES } from '../context'
import CreateGoalModal from '../components/savings/CreateGoalModal'
import ContributionModal from '../components/savings/ContributionModal'
import EditGoalModal from '../components/savings/EditGoalModal'
import DeleteGoalConfirmModal from '../components/savings/DeleteGoalConfirmModal'
import SavingsAnalyticsCharts from '../components/savings/SavingsAnalyticsCharts'

const CATEGORY_ICONS = {
  'Emergency Fund': ShieldCheck,
  Education: GraduationCap,
  Travel: Plane,
  'New Vehicle': Car,
  Electronics: Laptop,
  'Home Purchase': Home,
  Other: Target,
}

export const SavingsGoals = () => {
  const {
    savingsGoals,
    metrics,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addSavingsContribution,
  } = useFinance()

  const {
    totalSavingsTarget,
    totalAmountSaved,
    remainingSavingsAmount,
    overallGoalCompletionPercent,
  } = metrics

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [contributionTargetGoal, setContributionTargetGoal] = useState(null)
  const [editingGoal, setEditingGoal] = useState(null)
  const [deletingGoal, setDeletingGoal] = useState(null)
  const [expandedGoalHistory, setExpandedGoalHistory] = useState(null)

  const handleDeleteConfirm = () => {
    if (deletingGoal) {
      deleteSavingsGoal(deletingGoal.id)
      setDeletingGoal(null)
    }
  }

  // Calculate days remaining until target date
  const getDaysRemaining = (targetDateStr) => {
    if (!targetDateStr) return null
    const target = new Date(targetDateStr)
    const today = new Date('2026-11-19') // using current app simulated date
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
            <span className="text-xs text-text-muted hidden sm:inline">• Multi-Goal Milestone Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Savings Goals
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Set meaningful financial goals and track your progress towards achieving them.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
            icon={Plus}
            iconPosition="left"
            className="text-xs font-semibold shadow-sm hover:shadow-glow-primary"
          >
            Create Goal
          </Button>
        </div>
      </div>

      {/* 2. Dynamic KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Savings Target */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Total Savings Target</span>
            <span className="p-1 rounded-md bg-primary/15 text-secondary">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-text-primary tracking-tight">
            ₹{totalSavingsTarget.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Target across {savingsGoals.length} milestones</p>
        </div>

        {/* Total Amount Saved */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Total Amount Saved</span>
            <span className="p-1 rounded-md bg-success/15 text-success">
              <PiggyBank className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-success tracking-tight">
            ₹{totalAmountSaved.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Secured in high-yield reserves</p>
        </div>

        {/* Remaining Amount */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Remaining Amount</span>
            <span className="p-1 rounded-md bg-warning/15 text-warning">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-text-primary tracking-tight">
            ₹{remainingSavingsAmount.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Required to complete all goals</p>
        </div>

        {/* Overall Goal Completion */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Overall Completion</span>
            <span className="p-1 rounded-md bg-secondary/15 text-secondary">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-secondary tracking-tight">
            {overallGoalCompletionPercent}%
          </div>
          <p className="text-[10px] text-text-muted">Weighted milestone completion</p>
        </div>
      </div>

      {/* 3. Savings Analytics Charts */}
      {savingsGoals.length > 0 && (
        <SavingsAnalyticsCharts savingsGoals={savingsGoals} />
      )}

      {/* 4. Active Savings Goals Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Active Goals ({savingsGoals.length})
            </h2>
            <span className="text-xs text-text-muted hidden sm:inline">
              • Auto-calculated progress percentages
            </span>
          </div>
          <span className="text-xs text-text-muted">
            Contributions strictly capped at target limit
          </span>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
            <PiggyBank className="w-12 h-12 text-text-muted mx-auto opacity-50" />
            <h3 className="text-base font-bold text-text-primary">No savings goals defined</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Create your first savings goal to start building your emergency fund, dream vacation, or purchase reserve.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateModalOpen(true)}
              icon={Plus}
            >
              Create First Goal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savingsGoals.map((goal) => {
              const Icon = CATEGORY_ICONS[goal.category] || Target
              const percent =
                goal.targetAmount > 0
                  ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
                  : 0
              const remaining = Math.max(0, goal.targetAmount - goal.savedAmount)
              const isCompleted = goal.savedAmount >= goal.targetAmount
              const daysLeft = getDaysRemaining(goal.targetDate)
              const isExpanded = expandedGoalHistory === goal.id

              let statusLabel = 'In Progress'
              let statusStyle = 'text-primary bg-primary/10 border-primary/20'

              if (isCompleted) {
                statusLabel = 'Completed 🎉'
                statusStyle = 'text-success bg-success/10 border-success/30'
              } else if (percent >= 75) {
                statusLabel = 'Almost Done'
                statusStyle = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              }

              return (
                <div
                  key={goal.id}
                  className="rounded-2xl bg-card border border-border p-5 shadow-card flex flex-col justify-between hover:border-slate-700 transition-all duration-200 group text-left"
                >
                  <div>
                    {/* Goal Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-secondary border border-primary/20 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-text-primary text-sm sm:text-base tracking-tight">
                              {goal.name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusStyle}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <span className="text-xs text-text-muted">{goal.category}</span>
                        </div>
                      </div>

                      {/* Action icons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingGoal(goal)}
                          title="Edit Goal"
                          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingGoal(goal)}
                          title="Delete Goal"
                          className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Description if present */}
                    {goal.description && (
                      <p className="text-xs text-text-secondary line-clamp-2 mb-3 leading-relaxed">
                        {goal.description}
                      </p>
                    )}

                    {/* Progress Numbers */}
                    <div className="flex items-baseline justify-between my-2 text-xs">
                      <div>
                        <span className="text-text-muted text-[10px] block">Current Saved</span>
                        <span className="text-xl font-extrabold text-success">
                          ₹{goal.savedAmount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-text-muted text-[10px] block">Target</span>
                        <span className="text-sm font-bold text-text-primary">
                          ₹{goal.targetAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-border rounded-full h-2.5 overflow-hidden my-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-emerald-400'
                            : percent >= 75
                            ? 'bg-emerald-500'
                            : 'bg-primary'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* Progress Info Row */}
                    <div className="flex items-center justify-between text-[11px] text-text-muted mt-1">
                      <span>{percent}% Completed</span>
                      <span>
                        {remaining > 0
                          ? `₹${remaining.toLocaleString('en-IN')} remaining`
                          : 'Milestone Fully Funded!'}
                      </span>
                    </div>

                    {/* Target Date & Timeline Info */}
                    <div className="mt-3 p-2.5 rounded-xl bg-background/80 border border-border flex items-center justify-between text-xs text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-text-muted" />
                        <span>Target: {goal.targetDate}</span>
                      </div>
                      <span className="font-semibold text-text-primary text-[11px]">
                        {daysLeft !== null && daysLeft > 0
                          ? `${daysLeft} days left`
                          : daysLeft === 0
                          ? 'Due today'
                          : 'Due date passed'}
                      </span>
                    </div>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="pt-3.5 mt-3.5 border-t border-border/70 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedGoalHistory(isExpanded ? null : goal.id)
                        }
                        className="text-[11px] text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
                      >
                        <span>
                          {(goal.contributions || []).length} deposits logged
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
                        disabled={isCompleted}
                        onClick={() => setContributionTargetGoal(goal)}
                        icon={PlusCircle}
                        iconPosition="left"
                        className="text-xs font-semibold"
                      >
                        {isCompleted ? 'Goal Reached' : 'Add Deposit'}
                      </Button>
                    </div>

                    {/* Expanded Contribution History */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-border/50 space-y-1.5 text-xs animate-in fade-in duration-150">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          Deposit History
                        </p>
                        {(goal.contributions || []).length === 0 ? (
                          <p className="text-[11px] text-text-muted italic">No deposits logged yet.</p>
                        ) : (
                          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                            {goal.contributions.map((c) => (
                              <div
                                key={c.id}
                                className="p-2 rounded-lg bg-background border border-border flex items-center justify-between text-[11px]"
                              >
                                <div>
                                  <span className="font-semibold text-text-primary">
                                    +₹{c.amount.toLocaleString('en-IN')}
                                  </span>
                                  {c.note && (
                                    <span className="text-text-muted text-[10px] block truncate max-w-[180px]">
                                      {c.note}
                                    </span>
                                  )}
                                </div>
                                <span className="text-text-muted text-[10px] shrink-0">{c.date}</span>
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

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={addSavingsGoal}
      />

      {/* Add Contribution Modal */}
      <ContributionModal
        isOpen={Boolean(contributionTargetGoal)}
        onClose={() => setContributionTargetGoal(null)}
        onAddContribution={addSavingsContribution}
        goal={contributionTargetGoal}
      />

      {/* Edit Goal Modal */}
      <EditGoalModal
        isOpen={Boolean(editingGoal)}
        onClose={() => setEditingGoal(null)}
        onSave={updateSavingsGoal}
        goal={editingGoal}
      />

      {/* Delete Goal Confirm Modal */}
      <DeleteGoalConfirmModal
        isOpen={Boolean(deletingGoal)}
        onClose={() => setDeletingGoal(null)}
        onConfirm={handleDeleteConfirm}
        goal={deletingGoal}
      />
    </div>
  )
}

export default SavingsGoals
