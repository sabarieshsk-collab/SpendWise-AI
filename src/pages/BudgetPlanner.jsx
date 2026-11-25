import React, { useState, useMemo } from 'react'
import {
  PieChart,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Edit3,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Trash2,
  Utensils,
  Home,
  ShoppingBag,
  Car,
  Zap,
  CreditCard,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  Layers,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useFinance, EXPENSE_CATEGORIES } from '../context'
import EditBudgetModal from '../components/budget/EditBudgetModal'
import CreateBudgetModal from '../components/budget/CreateBudgetModal'
import DeleteBudgetConfirmModal from '../components/budget/DeleteBudgetConfirmModal'
import BudgetAnalyticsCharts from '../components/budget/BudgetAnalyticsCharts'
import TransactionModal from '../components/transactions/TransactionModal'

const CATEGORY_ICONS = {
  Food: Utensils,
  Housing: Home,
  Shopping: ShoppingBag,
  Transportation: Car,
  Utilities: Zap,
  Subscriptions: CreditCard,
  Entertainment: Film,
  Healthcare: HeartPulse,
  Education: GraduationCap,
  Travel: Plane,
  Other: Layers,
}

export const BudgetPlanner = () => {
  const {
    budgets,
    metrics,
    activePeriod,
    selectedPeriodId,
    setSelectedPeriodId,
    BUDGET_PERIODS,
    updateBudget,
    createBudget,
    deleteBudget,
    addTransaction,
  } = useFinance()

  const {
    periodCategorySpending,
    totalAllocatedBudget,
    periodExpenses,
    remainingBudget,
    overallUtilization,
    dateSpendingMap,
  } = metrics

  // Modal states
  const [editingCategory, setEditingCategory] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [isAddTxOpen, setIsAddTxOpen] = useState(false)

  // Computed Category Statistics for active period
  const categoryStats = useMemo(() => {
    return Object.keys(budgets).map((cat) => {
      const budgetObj = budgets[cat] || { limit: 5000 }
      const limit = budgetObj.limit || 0
      // Essential: Only expense transactions within the selected period are counted!
      const spent = periodCategorySpending[cat] || 0
      const remaining = limit - spent
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0

      let status = 'normal'
      let statusLabel = 'Within Limit (<50%)'
      let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'

      if (percent >= 100) {
        status = 'danger'
        statusLabel = '100% Limit Reached / Exceeded'
        statusColor = 'text-danger bg-danger/10 border-danger/30'
      } else if (percent >= 80) {
        status = 'warning'
        statusLabel = '80% Spending Warning'
        statusColor = 'text-warning bg-warning/10 border-warning/30'
      } else if (percent >= 50) {
        status = 'progress'
        statusLabel = '50% Budget Progress Update'
        statusColor = 'text-secondary bg-primary/10 border-primary/20'
      }

      return {
        category: cat,
        limit,
        spent,
        remaining,
        percent,
        status,
        statusLabel,
        statusColor,
        icon: CATEGORY_ICONS[cat] || Layers,
      }
    })
  }, [budgets, periodCategorySpending])

  // Extract critical warnings & anomalies
  const warningCategories = categoryStats.filter((c) => c.percent >= 80)

  const handleDeleteConfirm = () => {
    if (deletingCategory) {
      deleteBudget(deletingCategory)
      setDeletingCategory(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10 text-left">
      {/* 1. Page Header with Period Switcher and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-secondary border border-primary/30 uppercase tracking-wider">
              Sample Data
            </span>
            <span className="text-xs text-text-muted hidden sm:inline">• Automated 50/80/100% Rules</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Smart Budget Planner
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Plan monthly category allocations, monitor spending limits and receive smart threshold alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="appearance-none bg-card border border-border rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-text-primary hover:border-slate-700 focus:outline-none focus:border-primary/60 cursor-pointer"
            >
              {BUDGET_PERIODS.map((p) => (
                <option key={p.id} value={p.id} className="bg-sidebar text-text-primary">
                  {p.label}
                </option>
              ))}
            </select>
            <Calendar className="w-4 h-4 text-text-muted absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
            icon={Plus}
            iconPosition="left"
            className="text-xs font-semibold"
          >
            Create Envelope
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddTxOpen(true)}
            icon={Plus}
            iconPosition="left"
            className="text-xs font-semibold shadow-sm hover:shadow-glow-primary"
          >
            Record Expense
          </Button>
        </div>
      </div>

      {/* Date Range Reporting Subheader */}
      <div className="p-3 rounded-xl bg-sidebar/50 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-text-muted gap-2">
        <div className="flex items-center gap-2">
          <span className="text-text-primary font-semibold">{activePeriod.label} Cycle:</span>
          <span>
            {activePeriod.startDate} to {activePeriod.endDate}
          </span>
        </div>
        <span className="text-[11px] text-secondary font-medium">
          Budget consumption is strictly isolated to expense transactions within this cycle.
        </span>
      </div>

      {/* 2. Overall Budget Health KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Allocated */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Total Budget Limit</span>
            <span className="p-1 rounded-md bg-primary/15 text-secondary">
              <PieChart className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-text-primary tracking-tight">
            ₹{totalAllocatedBudget.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Allocated across {Object.keys(budgets).length} envelopes</p>
        </div>

        {/* Total Spent to Date */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Period Expenses</span>
            <span className="p-1 rounded-md bg-warning/15 text-warning">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-text-primary tracking-tight">
            ₹{periodExpenses.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Calculated from period ledger</p>
        </div>

        {/* Remaining Budget */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Remaining Runway</span>
            <span className="p-1 rounded-md bg-success/15 text-success">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div
            className={`text-2xl font-extrabold tracking-tight ${
              remainingBudget >= 0 ? 'text-success' : 'text-danger'
            }`}
          >
            {remainingBudget >= 0 ? '+' : ''}₹{remainingBudget.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Available until period closes</p>
        </div>

        {/* Overall Utilization */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Overall Utilization</span>
            <span className="p-1 rounded-md bg-secondary/15 text-secondary">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div
            className={`text-2xl font-extrabold tracking-tight ${
              overallUtilization >= 80 ? 'text-warning' : 'text-secondary'
            }`}
          >
            {overallUtilization}%
          </div>
          <p className="text-[10px] text-text-muted">Optimal target: Under 80%</p>
        </div>
      </div>

      {/* 3. Budget Analytics Recharts Section */}
      <BudgetAnalyticsCharts
        categoryStats={categoryStats}
        activePeriod={activePeriod}
        dateSpendingMap={dateSpendingMap}
      />

      {/* 4. Smart Alerts & AI Reallocation Feed */}
      {warningCategories.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-card via-card to-sidebar border border-warning/30 shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Automated Threshold Alerts ({warningCategories.length} Envelopes Triggered)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {warningCategories.map((w) => (
              <div
                key={w.category}
                className="p-3 rounded-xl bg-background/80 border border-border flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-text-primary block">{w.category}</span>
                  <span className="text-[10px] text-text-muted">
                    Spent ₹{w.spent.toLocaleString('en-IN')} of ₹{w.limit.toLocaleString('en-IN')} limit
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${w.statusColor}`}
                  >
                    {w.percent}% reached
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-text-secondary">
            💡 <strong>AI Recommendation:</strong> Re-allocate ₹2,000 from underutilized categories (e.g. Travel or Education) to offset these overages before the cycle closes.
          </p>
        </div>
      )}

      {/* 5. Category Budget Envelopes Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
            Category Budget Envelopes ({categoryStats.length})
          </h2>
          <span className="text-xs text-text-muted">
            Adjust limits or delete envelopes anytime
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map((item) => {
            const Icon = item.icon
            const isDanger = item.percent >= 100
            const isWarning = item.percent >= 80 && item.percent < 100
            const isProgress = item.percent >= 50 && item.percent < 80

            return (
              <div
                key={item.category}
                className="rounded-2xl bg-card border border-border p-5 shadow-card flex flex-col justify-between hover:border-slate-700 transition-all duration-200 group"
              >
                <div>
                  {/* Card Header: Icon, Category Name & Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-secondary border border-primary/20 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-text-primary text-sm tracking-tight">
                          {item.category}
                        </h3>
                        <span className="text-[10px] text-text-muted">
                          Limit: ₹{item.limit.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(item)}
                        aria-label={`Adjust budget for ${item.category}`}
                        title="Adjust Budget"
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingCategory(item.category)}
                        aria-label={`Delete envelope for ${item.category}`}
                        title="Delete Envelope"
                        className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Spent vs Limit Numbers */}
                  <div className="flex items-baseline justify-between my-2 text-xs">
                    <div>
                      <span className="text-text-muted text-[10px] block">Spent</span>
                      <span className="text-lg font-extrabold text-text-primary">
                        ₹{item.spent.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-text-muted text-[10px] block">Remaining</span>
                      <span
                        className={`text-sm font-bold ${
                          item.remaining >= 0 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {item.remaining >= 0 ? '+' : ''}₹{item.remaining.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with 50/80/100 thresholds */}
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden my-2.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDanger
                          ? 'bg-danger'
                          : isWarning
                          ? 'bg-warning'
                          : isProgress
                          ? 'bg-primary'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(item.percent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Footer Pill & Action */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${item.statusColor}`}
                  >
                    {item.statusLabel}
                  </span>

                  <button
                    type="button"
                    onClick={() => setEditingCategory(item)}
                    className="text-secondary hover:underline font-medium text-[11px]"
                  >
                    Adjust Limit →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Edit Budget Modal */}
      <EditBudgetModal
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        onSave={updateBudget}
        category={editingCategory?.category}
        currentLimit={editingCategory?.limit}
      />

      {/* Create Budget Modal */}
      <CreateBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={createBudget}
        existingCategories={Object.keys(budgets)}
      />

      {/* Delete Budget Confirmation Modal */}
      <DeleteBudgetConfirmModal
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        category={deletingCategory}
      />

      {/* Quick Add Expense Modal */}
      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSubmit={addTransaction}
        mode="add"
      />
    </div>
  )
}

export default BudgetPlanner
