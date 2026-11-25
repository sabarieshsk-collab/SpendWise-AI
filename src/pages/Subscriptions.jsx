import React, { useState, useMemo } from 'react'
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Calendar,
  Trash2,
  Edit3,
  PauseCircle,
  PlayCircle,
  XCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  LayoutGrid,
  List,
  RefreshCw,
  Film,
  Laptop,
  Cloud,
  GraduationCap,
  Activity,
  Layers,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import {
  useFinance,
  SUBSCRIPTION_CATEGORIES,
  calculateMonthlyEquivalent,
} from '../context'
import AddSubscriptionModal from '../components/subscriptions/AddSubscriptionModal'
import EditSubscriptionModal from '../components/subscriptions/EditSubscriptionModal'
import DeleteSubscriptionConfirmModal from '../components/subscriptions/DeleteSubscriptionConfirmModal'
import SubscriptionAnalyticsCharts from '../components/subscriptions/SubscriptionAnalyticsCharts'

const CATEGORY_ICONS = {
  Entertainment: Film,
  Software: Laptop,
  Productivity: Sparkles,
  'Cloud Storage': Cloud,
  Education: GraduationCap,
  Fitness: Activity,
  Other: Layers,
}

export const Subscriptions = () => {
  const {
    subscriptions,
    metrics,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
  } = useFinance()

  const {
    activeSubscriptionsCount,
    monthlyRecurringCost,
    annualizedSubscriptionCost,
  } = metrics

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All') // 'All' | 'Active' | 'Paused' | 'Cancelled' | 'Expired'
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [viewMode, setViewMode] = useState('cards') // 'cards' | 'table'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState(null)
  const [deletingSub, setDeletingSub] = useState(null)

  // Calculate upcoming renewals within next 14 days
  const upcomingRenewalsCount = useMemo(() => {
    const today = new Date('2026-11-19')
    const in14Days = new Date(today)
    in14Days.setDate(today.getDate() + 14)

    return subscriptions.filter((s) => {
      if (s.status !== 'Active') return false
      const renewal = new Date(s.nextRenewalDate)
      return renewal >= today && renewal <= in14Days
    }).length
  }, [subscriptions])

  // Filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => {
      // Status filter
      if (statusFilter !== 'All' && s.status !== statusFilter) return false
      // Category filter
      if (categoryFilter !== 'All' && s.category !== categoryFilter) return false
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchesName = s.name.toLowerCase().includes(query)
        const matchesProvider = s.provider.toLowerCase().includes(query)
        const matchesCat = s.category.toLowerCase().includes(query)
        if (!matchesName && !matchesProvider && !matchesCat) return false
      }
      return true
    })
  }, [subscriptions, statusFilter, categoryFilter, searchTerm])

  const handleDeleteConfirm = () => {
    if (deletingSub) {
      deleteSubscription(deletingSub.id)
      setDeletingSub(null)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'text-success bg-success/10 border-success/30'
      case 'Paused':
        return 'text-warning bg-warning/10 border-warning/30'
      case 'Cancelled':
        return 'text-danger bg-danger/10 border-danger/30'
      case 'Expired':
        return 'text-text-muted bg-slate-800 border-slate-700'
      default:
        return 'text-secondary bg-primary/10 border-primary/20'
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
              • Normalized Monthly & Annual Burn Rate Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Subscription Manager
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Track recurring subscriptions, renewal dates and upcoming payments.
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
            Add Subscription
          </Button>
        </div>
      </div>

      {/* 2. Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Subscriptions */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Active Subscriptions</span>
            <span className="p-1 rounded-md bg-primary/15 text-secondary">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-text-primary tracking-tight">
            {activeSubscriptionsCount}
          </div>
          <p className="text-[10px] text-text-muted">
            {subscriptions.length - activeSubscriptionsCount} paused / inactive plans
          </p>
        </div>

        {/* Monthly Recurring Cost */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Monthly Recurring Cost</span>
            <span className="p-1 rounded-md bg-secondary/15 text-secondary">
              <RefreshCw className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-secondary tracking-tight">
            ₹{monthlyRecurringCost.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Normalized monthly equivalent outlay</p>
        </div>

        {/* Annualized Subscription Cost */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Annualized Cost</span>
            <span className="p-1 rounded-md bg-warning/15 text-warning">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-warning tracking-tight">
            ₹{annualizedSubscriptionCost.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Yearly recurring commitment</p>
        </div>

        {/* Upcoming Renewals in Next 14 Days */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Upcoming (14 Days)</span>
            <span className="p-1 rounded-md bg-emerald-500/15 text-emerald-400">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
            {upcomingRenewalsCount}
          </div>
          <p className="text-[10px] text-text-muted">Due for renewal before cycle closes</p>
        </div>
      </div>

      {/* 3. Recharts Analytics */}
      {subscriptions.length > 0 && (
        <SubscriptionAnalyticsCharts subscriptions={subscriptions} />
      )}

      {/* 4. Filter Toolbar & Search Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-card space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by plan name, provider, or category..."
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-primary/60"
            />
          </div>

          {/* Filters & View Mode */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category Select */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-background border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {SUBSCRIPTION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="p-0.5 rounded-xl bg-background border border-border flex items-center">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Grid Cards View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-card text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-card text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/60 text-xs">
          <span className="text-[11px] text-text-muted mr-1">Status:</span>
          {['All', 'Active', 'Paused', 'Cancelled', 'Expired'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-primary/20 text-secondary border border-primary/40 font-bold'
                  : 'bg-background text-text-secondary hover:text-text-primary border border-border'
              }`}
            >
              {st}
            </button>
          ))}
          {(searchTerm || statusFilter !== 'All' || categoryFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('All')
                setCategoryFilter('All')
              }}
              className="text-[11px] text-secondary hover:underline ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 5. Subscriptions List (Cards or Table) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
            Subscriptions ({filteredSubscriptions.length})
          </h2>
          <span className="text-xs text-text-muted">
            Pause, resume, or cancel without accidental renewal
          </span>
        </div>

        {filteredSubscriptions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
            <CreditCard className="w-12 h-12 text-text-muted mx-auto opacity-50" />
            <h3 className="text-base font-bold text-text-primary">No subscriptions match criteria</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Try adjusting your status or category filters, or register a new recurring membership.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAddModalOpen(true)}
              icon={Plus}
            >
              Add Subscription
            </Button>
          </div>
        ) : viewMode === 'cards' ? (
          /* Grid Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubscriptions.map((sub) => {
              const Icon = CATEGORY_ICONS[sub.category] || Layers
              const monthlyEq = calculateMonthlyEquivalent(sub.amount, sub.frequency)

              return (
                <div
                  key={sub.id}
                  className="rounded-2xl bg-card border border-border p-5 shadow-card flex flex-col justify-between hover:border-slate-700 transition-all duration-200 group text-left"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-secondary border border-primary/20 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-text-primary text-sm tracking-tight truncate max-w-[140px]">
                              {sub.name}
                            </h3>
                          </div>
                          <span className="text-xs text-text-muted block truncate max-w-[160px]">
                            {sub.provider}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${getStatusBadge(
                          sub.status
                        )}`}
                      >
                        {sub.status}
                      </span>
                    </div>

                    {/* Cost Details */}
                    <div className="p-3 rounded-xl bg-background border border-border space-y-1.5 my-2.5 text-xs">
                      <div className="flex items-baseline justify-between">
                        <span className="text-text-muted text-[10px]">Billed Fee</span>
                        <span className="text-base font-extrabold text-text-primary">
                          ₹{sub.amount.toLocaleString('en-IN')}{' '}
                          <span className="text-xs text-text-muted font-normal">
                            /{sub.frequency.toLowerCase()}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1 border-t border-border/50">
                        <span>Monthly Normalized</span>
                        <span className="font-bold text-secondary">
                          ₹{monthlyEq.toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                    </div>

                    {/* Schedule & Auto-Renewal */}
                    <div className="space-y-1 text-xs text-text-secondary">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-text-muted">
                          <Calendar className="w-3.5 h-3.5" /> Next Renewal:
                        </span>
                        <span className="font-semibold text-text-primary">{sub.nextRenewalDate}</span>
                      </div>
                      {sub.expiryDate && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-text-muted">Contract Expiry:</span>
                          <span className="text-text-secondary">{sub.expiryDate}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Auto-Renewal:</span>
                        <span className={sub.autoRenewal ? 'text-success' : 'text-text-muted'}>
                          {sub.autoRenewal ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3.5 mt-3.5 border-t border-border/70 flex items-center justify-between gap-1 text-xs">
                    {/* Status Toggles */}
                    <div className="flex items-center gap-1">
                      {sub.status === 'Active' ? (
                        <button
                          type="button"
                          onClick={() => toggleSubscriptionStatus(sub.id, 'Paused')}
                          title="Pause Subscription"
                          className="px-2 py-1 rounded-lg bg-background border border-border text-text-secondary hover:text-warning hover:border-warning/30 transition-colors flex items-center gap-1 text-[11px]"
                        >
                          <PauseCircle className="w-3.5 h-3.5" />
                          <span>Pause</span>
                        </button>
                      ) : sub.status === 'Paused' ? (
                        <button
                          type="button"
                          onClick={() => toggleSubscriptionStatus(sub.id, 'Active')}
                          title="Resume Subscription"
                          className="px-2 py-1 rounded-lg bg-background border border-border text-text-secondary hover:text-success hover:border-success/30 transition-colors flex items-center gap-1 text-[11px]"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Resume</span>
                        </button>
                      ) : null}

                      {sub.status !== 'Cancelled' && (
                        <button
                          type="button"
                          onClick={() => toggleSubscriptionStatus(sub.id, 'Cancelled')}
                          title="Cancel Subscription"
                          className="px-2 py-1 rounded-lg bg-background border border-border text-text-secondary hover:text-danger hover:border-danger/30 transition-colors flex items-center gap-1 text-[11px]"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>

                    {/* Edit & Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingSub(sub)}
                        title="Edit Plan"
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingSub(sub)}
                        title="Delete Plan"
                        className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Table View */
          <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sidebar/80 border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Service</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold">Normalized/mo</th>
                    <th className="py-3 px-4 font-semibold">Next Renewal</th>
                    <th className="py-3 px-4 font-semibold">Auto-Renew</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredSubscriptions.map((sub) => {
                    const monthlyEq = calculateMonthlyEquivalent(sub.amount, sub.frequency)
                    return (
                      <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-text-primary block">{sub.name}</span>
                          <span className="text-[10px] text-text-muted">{sub.provider}</span>
                        </td>
                        <td className="py-3 px-4 text-text-secondary">{sub.category}</td>
                        <td className="py-3 px-4 font-semibold text-text-primary">
                          ₹{sub.amount.toLocaleString('en-IN')}/{sub.frequency.toLowerCase()}
                        </td>
                        <td className="py-3 px-4 font-bold text-secondary">
                          ₹{monthlyEq.toLocaleString('en-IN')}/mo
                        </td>
                        <td className="py-3 px-4 text-text-secondary">{sub.nextRenewalDate}</td>
                        <td className="py-3 px-4">
                          <span className={sub.autoRenewal ? 'text-success font-semibold' : 'text-text-muted'}>
                            {sub.autoRenewal ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(
                              sub.status
                            )}`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {sub.status === 'Active' ? (
                              <button
                                type="button"
                                onClick={() => toggleSubscriptionStatus(sub.id, 'Paused')}
                                title="Pause"
                                className="p-1 rounded text-text-muted hover:text-warning"
                              >
                                <PauseCircle className="w-3.5 h-3.5" />
                              </button>
                            ) : sub.status === 'Paused' ? (
                              <button
                                type="button"
                                onClick={() => toggleSubscriptionStatus(sub.id, 'Active')}
                                title="Resume"
                                className="p-1 rounded text-text-muted hover:text-success"
                              >
                                <PlayCircle className="w-3.5 h-3.5" />
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => setEditingSub(sub)}
                              title="Edit"
                              className="p-1 rounded text-text-muted hover:text-text-primary"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingSub(sub)}
                              title="Delete"
                              className="p-1 rounded text-text-muted hover:text-danger"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addSubscription}
      />

      {/* Edit Subscription Modal */}
      <EditSubscriptionModal
        isOpen={Boolean(editingSub)}
        onClose={() => setEditingSub(null)}
        onSave={updateSubscription}
        subscription={editingSub}
      />

      {/* Delete Subscription Confirm Modal */}
      <DeleteSubscriptionConfirmModal
        isOpen={Boolean(deletingSub)}
        onClose={() => setDeletingSub(null)}
        onConfirm={handleDeleteConfirm}
        subscription={deletingSub}
      />
    </div>
  )
}

export default Subscriptions
