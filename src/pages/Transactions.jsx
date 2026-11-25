import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Filter,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Receipt,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useFinance, EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../context'
import TransactionModal from '../components/transactions/TransactionModal'
import DeleteConfirmModal from '../components/transactions/DeleteConfirmModal'
import TransactionDetailModal from '../components/transactions/TransactionDetailModal'

export const Transactions = () => {
  const { transactions, metrics, addTransaction, deleteTransaction, updateTransaction } = useFinance()

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [selectedTx, setSelectedTx] = useState(null)
  const [detailTx, setDetailTx] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Filter & Search states
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'income' | 'expense'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date-desc') // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

  // Date Range Filtering
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)

  // Reset all filters
  const handleResetFilters = () => {
    setTypeFilter('all')
    setCategoryFilter('all')
    setPaymentFilter('all')
    setSearchQuery('')
    setStartDate('')
    setEndDate('')
    setSortBy('date-desc')
    setCurrentPage(1)
  }

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false
        // Category filter
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false
        // Payment Method filter
        if (paymentFilter !== 'all' && tx.paymentMethod !== paymentFilter) return false
        // Start date filter
        if (startDate && tx.date < startDate) return false
        // End date filter
        if (endDate && tx.date > endDate) return false
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchDesc = tx.description.toLowerCase().includes(q)
          const matchCat = tx.category.toLowerCase().includes(q)
          const matchMethod = (tx.paymentMethod || '').toLowerCase().includes(q)
          const matchNotes = (tx.notes || '').toLowerCase().includes(q)
          if (!matchDesc && !matchCat && !matchMethod && !matchNotes) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date)
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date)
        if (sortBy === 'amount-desc') return b.amount - a.amount
        if (sortBy === 'amount-asc') return a.amount - b.amount
        return 0
      })
  }, [transactions, typeFilter, categoryFilter, paymentFilter, startDate, endDate, searchQuery, sortBy])

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage))
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredTransactions.slice(start, start + itemsPerPage)
  }, [filteredTransactions, currentPage, itemsPerPage])

  // Filtered dynamic metrics
  const activeMetrics = useMemo(() => {
    let inc = 0
    let exp = 0
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') inc += t.amount
      else exp += t.amount
    })
    return {
      income: inc,
      expenses: exp,
      net: inc - exp,
      count: filteredTransactions.length,
    }
  }, [filteredTransactions])

  // Handle CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Description', 'Category', 'Payment Method', 'Amount (INR)', 'Notes']
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      t.type.toUpperCase(),
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      t.paymentMethod || 'N/A',
      t.amount,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `SpendWise_Transactions_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenAdd = () => {
    setSelectedTx(null)
    setModalMode('add')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (tx) => {
    setSelectedTx(tx)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleModalSubmit = (payload) => {
    if (modalMode === 'add') {
      addTransaction(payload)
    } else if (selectedTx) {
      updateTransaction(selectedTx.id, payload)
    }
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteTransaction(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const hasActiveFilters =
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    paymentFilter !== 'all' ||
    searchQuery.trim() !== '' ||
    startDate !== '' ||
    endDate !== ''

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10 text-left">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-secondary border border-primary/30 uppercase tracking-wider">
              Sample Data
            </span>
            <span className="text-xs text-text-muted hidden sm:inline">• Shared Ledger Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Transaction Management
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Track, organize and manage all your income and expenses in one place.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={handleExportCSV}
            icon={Download}
            iconPosition="left"
            className="text-xs font-semibold"
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAdd}
            icon={Plus}
            iconPosition="left"
            className="text-xs font-semibold shadow-sm hover:shadow-glow-primary"
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* 2. Dynamic Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Total Income</span>
            <span className="p-1 rounded-md bg-success/15 text-success">
              <ArrowDownLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-success tracking-tight">
            +₹{activeMetrics.income.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Calculated from filtered records</p>
        </div>

        {/* Total Expenses */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Total Expenses</span>
            <span className="p-1 rounded-md bg-warning/15 text-warning">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-text-primary tracking-tight">
            ₹{activeMetrics.expenses.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Current period outlays</p>
        </div>

        {/* Net Cash Flow */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Net Cash Flow</span>
            <span className="p-1 rounded-md bg-primary/15 text-secondary">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div
            className={`text-2xl font-extrabold tracking-tight ${
              activeMetrics.net >= 0 ? 'text-secondary' : 'text-danger'
            }`}
          >
            {activeMetrics.net >= 0 ? '+' : ''}₹{activeMetrics.net.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-text-muted">Inflow vs outflow surplus</p>
        </div>

        {/* Total Transactions */}
        <div className="rounded-2xl bg-card border border-border p-4.5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Total Transactions</span>
            <span className="p-1 rounded-md bg-white/5 text-text-secondary">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-text-primary tracking-tight">
            {activeMetrics.count}
          </div>
          <p className="text-[10px] text-text-muted">Matching ledger entries</p>
        </div>
      </div>

      {/* 3. Comprehensive Filter Controls Bar */}
      <div className="rounded-2xl bg-card border border-border p-4 space-y-3.5 shadow-card">
        {/* Row 1: Search, Type Pills, Categories, Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search description, merchant, or notes..."
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="sm:col-span-3 flex items-center p-0.5 rounded-xl bg-background border border-border text-xs">
            {['all', 'income', 'expense'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTypeFilter(t)
                  setCurrentPage(1)
                }}
                className={`flex-1 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                  typeFilter === t
                    ? 'bg-card text-text-primary font-bold shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <optgroup label="Expense Categories">
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Income Categories">
                {INCOME_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Row 2: Date Range Filtering & Payment Method */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-text-muted flex items-center gap-1 font-medium text-[11px]">
              <Calendar className="w-3.5 h-3.5" /> Date Range:
            </span>

            {/* Start Date */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-text-muted">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            {/* End Date */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-text-muted">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-primary/60"
              />
            </div>

            {/* Payment Method Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-primary/60 cursor-pointer"
            >
              <option value="all">All Payment Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button if active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-secondary hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Transactions Ledger Table */}
      <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-sidebar/50 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Transaction Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => setDetailTx(tx)}
                  >
                    {/* Description & Icon */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                            tx.type === 'income'
                              ? 'bg-success/15 text-success border-success/30'
                              : 'bg-card border-border text-text-secondary'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary truncate">{tx.description}</p>
                          {tx.notes && (
                            <p className="text-[10px] text-text-muted truncate max-w-xs">{tx.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-background border border-border text-secondary">
                        {tx.category}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4 text-text-secondary">
                      <span className="inline-flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-text-muted" />
                        <span>{tx.paymentMethod || 'UPI'}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-text-secondary whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-extrabold text-sm ${
                          tx.type === 'income' ? 'text-success' : 'text-text-primary'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Action buttons (View Details, Edit, Delete) */}
                    <td
                      className="py-3 px-4 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDetailTx(tx)}
                          aria-label="View transaction details"
                          title="View Details"
                          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(tx)}
                          aria-label="Edit transaction"
                          title="Edit Transaction"
                          className="p-1.5 rounded-lg text-text-muted hover:text-secondary hover:bg-primary/10 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(tx)}
                          aria-label="Delete transaction"
                          title="Delete Transaction"
                          className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-text-primary">No matching transactions found</p>
                    <p className="text-xs mt-0.5">
                      No records matched your selected filters or search query.
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleResetFilters}
                        icon={RotateCcw}
                        iconPosition="left"
                        className="mt-3 text-xs"
                      >
                        Reset All Filters
                      </Button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Ledger Table Footer */}
        <div className="p-3 bg-sidebar/50 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-text-muted">
          <div>
            Showing{' '}
            <strong className="text-text-primary">
              {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-text-primary">
              {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}
            </strong>{' '}
            of <strong className="text-text-primary">{filteredTransactions.length}</strong> matching records
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-border bg-card text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="font-mono text-text-primary px-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-border bg-card text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedTx}
        mode={modalMode}
      />

      {/* Transaction Details Modal */}
      <TransactionDetailModal
        isOpen={Boolean(detailTx)}
        onClose={() => setDetailTx(null)}
        transaction={detailTx}
        onEdit={(tx) => {
          setDetailTx(null)
          handleOpenEdit(tx)
        }}
        onDelete={(tx) => {
          setDetailTx(null)
          setDeleteTarget(tx)
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        itemTitle={deleteTarget?.description || ''}
      />
    </div>
  )
}

export default Transactions
