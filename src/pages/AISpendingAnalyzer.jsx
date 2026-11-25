import React, { useState, useMemo, useEffect } from 'react'
import {
  TrendingUp,
  Calendar,
  RefreshCw,
  Sparkles,
  PieChart as PieIcon,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Clock,
  Wallet,
  Receipt,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Zap,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useFinance } from '../context'
import {
  calculateSpendingOverview,
  calculateCategoryAnalysis,
  detectSpendingPatterns,
  detectUnusualSpending,
  calculateMonthOverMonthComparison,
  fetchAISpendingAnalysis,
  formatINR,
} from '../services/spendingAnalyzerService'
import SpendingAnalyzerCharts from '../components/analyzer/SpendingAnalyzerCharts'
import AISpendingReport from '../components/analyzer/AISpendingReport'

export const AISpendingAnalyzer = () => {
  const {
    transactions,
    budgets,
    subscriptions,
    BUDGET_PERIODS,
    selectedPeriodId,
    setSelectedPeriodId,
    activePeriod,
  } = useFinance()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysisTime, setLastAnalysisTime] = useState('Just now')

  // Live AI Spending Diagnostic States
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [aiModel, setAiModel] = useState('NVIDIA Nemotron 3 Ultra')
  const [lastAIAnalyzed, setLastAIAnalyzed] = useState(null)

  // 1. Spending Overview Metrics
  const overview = useMemo(() => {
    return calculateSpendingOverview(transactions, activePeriod, BUDGET_PERIODS)
  }, [transactions, activePeriod, BUDGET_PERIODS])

  // 2. Category Analysis
  const categoryAnalysis = useMemo(() => {
    return calculateCategoryAnalysis(transactions, budgets, activePeriod)
  }, [transactions, budgets, activePeriod])

  // 3. Pattern Detection Findings
  const patterns = useMemo(() => {
    return detectSpendingPatterns(transactions, activePeriod, budgets, subscriptions)
  }, [transactions, activePeriod, budgets, subscriptions])

  // 4. Unusual Spending Anomalies
  const unusualFindings = useMemo(() => {
    return detectUnusualSpending(transactions, activePeriod)
  }, [transactions, activePeriod])

  // 5. Month-over-Month Comparison
  const momComparison = useMemo(() => {
    return calculateMonthOverMonthComparison(transactions, activePeriod, BUDGET_PERIODS)
  }, [transactions, activePeriod, BUDGET_PERIODS])

  // Executes Live AI Spending Analysis via OpenRouter endpoint
  const runAISpendingAnalysis = async () => {
    setIsAnalyzingAI(true)
    setAiError(null)

    const payload = {
      period: activePeriod.label || 'November 2026',
      totalSpending: overview.totalSpending,
      averageDailySpending: overview.averageDailySpending,
      effectiveDays: overview.effectiveDays,
      highestCategory: overview.highestCategory,
      largestTransaction: overview.largestTransaction,
      monthOverMonth: overview.monthOverMonth,
      categories: categoryAnalysis.categories,
      patterns: patterns,
      unusualFindings: unusualFindings.detections || [],
      savingsOpportunities: overview.savingsOpportunities,
    }

    try {
      const result = await fetchAISpendingAnalysis(payload)
      setAiAnalysis(result.analysis)
      if (result.model) setAiModel(result.model)
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setLastAIAnalyzed(nowStr)
      setLastAnalysisTime(nowStr)
    } catch (err) {
      console.error('Failed to run AI spending analysis:', err)
      setAiError(err.message || 'Failed to complete AI spending analysis')
    } finally {
      setIsAnalyzingAI(false)
    }
  }

  // Trigger re-analysis for both deterministic metrics and live AI
  const handleRunAnalysis = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 400)
    runAISpendingAnalysis()
  }

  // Automatically fetch AI analysis when the active period changes
  useEffect(() => {
    runAISpendingAnalysis()
  }, [activePeriod.id])

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 text-left">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-secondary border border-primary/30 uppercase tracking-wider">
              Sample Data
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Demo Analysis Mode Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            AI Spending Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Understand your spending patterns, uncover hidden expenses and discover opportunities to save.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Analysis Period Selector */}
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

          {/* Analyze Spending Button */}
          <Button
            variant="primary"
            size="md"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || isAnalyzingAI}
            icon={RefreshCw}
            iconPosition="left"
            className="text-xs font-semibold shadow-sm hover:shadow-glow-primary"
          >
            {isAnalyzing || isAnalyzingAI ? 'Analyzing...' : 'Analyze Spending'}
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-3 rounded-xl bg-sidebar/50 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-text-muted gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-text-muted" />
          <span>Last analyzed: <strong className="text-text-primary">{lastAnalysisTime}</strong></span>
          <span>• Cycle: <strong className="text-secondary">{activePeriod.startDate} to {activePeriod.endDate}</strong></span>
        </div>
        <span className="text-[11px] text-text-secondary">
          Analyzed <strong>{overview.transactionCount} expense records</strong> in this cycle.
        </span>
      </div>

      {/* 2. Spending Overview (6 Dynamic KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Total Spending */}
        <div className="rounded-2xl bg-card border border-border p-4 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Total Outflow</span>
            <span className="p-1 rounded-md bg-primary/15 text-secondary">
              <Wallet className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-text-primary tracking-tight">
            {formatINR(overview.totalSpending)}
          </div>
          <p className="text-[10px] text-text-muted">{overview.transactionCount} transactions</p>
        </div>

        {/* 2. Average Daily Spending */}
        <div className="rounded-2xl bg-card border border-border p-4 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Average Daily</span>
            <span className="p-1 rounded-md bg-secondary/15 text-secondary">
              <Calendar className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-secondary tracking-tight">
            {formatINR(overview.averageDailySpending)}
          </div>
          <p className="text-[10px] text-text-muted">Over {overview.effectiveDays} tracked days</p>
        </div>

        {/* 3. Highest Spending Category */}
        <div className="rounded-2xl bg-card border border-border p-4 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Top Category</span>
            <span className="p-1 rounded-md bg-warning/15 text-warning">
              <PieIcon className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg font-extrabold text-text-primary truncate">
            {overview.highestCategory.name}
          </div>
          <p className="text-[10px] text-text-muted">
            {formatINR(overview.highestCategory.amount)} ({overview.highestCategory.percentage}% of total)
          </p>
        </div>

        {/* 4. Month-over-Month Change */}
        <div className="rounded-2xl bg-card border border-border p-4 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>MoM Variance</span>
            <span className="p-1 rounded-md bg-primary/15 text-secondary">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div
            className={`text-xl font-extrabold tracking-tight flex items-center gap-1 ${
              overview.monthOverMonth.percentChange > 0
                ? 'text-danger'
                : overview.monthOverMonth.percentChange < 0
                ? 'text-success'
                : 'text-text-primary'
            }`}
          >
            {overview.monthOverMonth.hasSufficientData ? (
              <>
                {overview.monthOverMonth.percentChange > 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{Math.abs(overview.monthOverMonth.percentChange)}%</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-text-muted">No Prior Data</span>
            )}
          </div>
          <p className="text-[10px] text-text-muted truncate">
            {overview.monthOverMonth.hasSufficientData
              ? `${overview.monthOverMonth.absoluteDiff >= 0 ? '+' : ''}${formatINR(
                  overview.monthOverMonth.absoluteDiff
                )} vs ${overview.monthOverMonth.previousPeriodLabel}`
              : 'Insufficient history'}
          </p>
        </div>

        {/* 5. Largest Transaction */}
        <div className="rounded-2xl bg-card border border-border p-4 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Largest Outlay</span>
            <span className="p-1 rounded-md bg-danger/15 text-danger">
              <Receipt className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg font-extrabold text-text-primary truncate">
            {overview.largestTransaction ? formatINR(overview.largestTransaction.amount) : '₹0'}
          </div>
          <p className="text-[10px] text-text-muted truncate">
            {overview.largestTransaction?.description || 'No expenses logged'}
          </p>
        </div>

        {/* 6. Potential Savings Opportunities */}
        <div className="rounded-2xl bg-card border border-border p-4 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Savings Potential</span>
            <span className="p-1 rounded-md bg-success/15 text-success">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-success tracking-tight">
            ~{formatINR(overview.savingsOpportunities.totalPotential)}
          </div>
          <p className="text-[10px] text-text-muted">Estimated monthly optimization</p>
        </div>
      </div>

      {/* 3. Live AI Financial Diagnostic & Strategic Insights (NVIDIA Nemotron 3 Ultra via OpenRouter) */}
      <AISpendingReport
        aiAnalysis={aiAnalysis}
        isAnalyzing={isAnalyzingAI}
        aiError={aiError}
        aiModel={aiModel}
        lastAnalyzed={lastAIAnalyzed}
        onRetry={runAISpendingAnalysis}
      />

      {/* 4. Recharts Section: Donut, Spent vs Budget & Trend */}
      <SpendingAnalyzerCharts
        categories={categoryAnalysis.categories}
        transactions={transactions}
        period={activePeriod}
      />

      {/* 5. Category-wise Spending Analysis Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Category Breakdown & Envelope Health ({categoryAnalysis.categories.length})
            </h2>
            <span className="text-xs text-text-muted hidden sm:inline">
              • Deterministic metrics from ledger transactions
            </span>
          </div>
          <span className="text-xs text-text-muted">
            Includes budget envelope limits and utilization
          </span>
        </div>

        <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sidebar/80 border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Total Spent</th>
                  <th className="py-3 px-4 font-semibold">Share (%)</th>
                  <th className="py-3 px-4 font-semibold">Transactions</th>
                  <th className="py-3 px-4 font-semibold">Avg / Purchase</th>
                  <th className="py-3 px-4 font-semibold">Budget Limit</th>
                  <th className="py-3 px-4 font-semibold">Utilization</th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {categoryAnalysis.categories.map((cat) => (
                  <tr key={cat.name} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">{cat.name}</span>
                        {cat.isHighest && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-warning/20 text-warning border border-warning/30">
                            Highest
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-text-primary">
                      {formatINR(cat.total)}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{cat.percentage}%</td>
                    <td className="py-3 px-4 text-text-muted">{cat.count} txns</td>
                    <td className="py-3 px-4 text-text-secondary">{formatINR(cat.avgTransaction)}</td>
                    <td className="py-3 px-4 text-text-muted">
                      {cat.budgetLimit > 0 ? formatINR(cat.budgetLimit) : 'No Limit'}
                    </td>
                    <td className="py-3 px-4">
                      {cat.utilization !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-border rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                cat.utilization >= 100
                                  ? 'bg-danger'
                                  : cat.utilization >= 80
                                  ? 'bg-warning'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(cat.utilization, 100)}%` }}
                            />
                          </div>
                          <span
                            className={`font-semibold text-[11px] ${
                              cat.utilization >= 80 ? 'text-warning' : 'text-text-secondary'
                            }`}
                          >
                            {cat.utilization}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-muted text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          cat.status === 'over'
                            ? 'text-danger bg-danger/10 border-danger/30'
                            : cat.status === 'warning'
                            ? 'text-warning bg-warning/10 border-warning/30'
                            : cat.status === 'progress'
                            ? 'text-secondary bg-primary/10 border-primary/20'
                            : cat.status === 'normal'
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-text-muted bg-slate-800 border-slate-700'
                        }`}
                      >
                        {cat.status === 'over'
                          ? '100% Breached'
                          : cat.status === 'warning'
                          ? '80% Warning'
                          : cat.status === 'progress'
                          ? '50% On Track'
                          : cat.status === 'normal'
                          ? 'Normal'
                          : 'Unbudgeted'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Spending Pattern Detection (Deterministic Rules) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-secondary" />
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Spending Pattern Detection ({patterns.length} Identified)
            </h2>
          </div>
          <span className="text-xs text-text-muted">
            Deterministic rules based on transaction size, frequency & concentration
          </span>
        </div>

        {patterns.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-card border border-border space-y-2">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
            <p className="text-xs font-semibold text-text-primary">
              No concerning spending patterns detected in this cycle.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((p) => {
              const isHigh = p.severity === 'High'
              const isMedium = p.severity === 'Medium'
              const isInfo = p.severity === 'Info'

              return (
                <div
                  key={p.id}
                  className="rounded-2xl bg-card border border-border p-5 shadow-card flex flex-col justify-between hover:border-slate-700 transition-all duration-200 text-left space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-secondary border border-primary/20">
                        {p.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isHigh
                            ? 'text-danger bg-danger/10 border-danger/30'
                            : isMedium
                            ? 'text-warning bg-warning/10 border-warning/30'
                            : 'text-text-secondary bg-slate-800 border-slate-700'
                        }`}
                      >
                        {p.severity} Severity
                      </span>
                    </div>

                    <h3 className="font-bold text-text-primary text-sm tracking-tight leading-snug">
                      {p.title}
                    </h3>

                    <div className="p-2.5 rounded-xl bg-background border border-border text-[11px] text-text-secondary font-mono">
                      📊 {p.supportingData}
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {p.explanation}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-border/60 text-xs">
                    <div className="flex items-start gap-1.5 text-secondary">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-relaxed">
                        <strong>Suggested Action:</strong> {p.suggestedAction}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 6. Unusual Spending Detection (Rule-Based Anomaly Detection) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-warning" />
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Unusual Spending Detection ({unusualFindings.detections.length})
            </h2>
          </div>
          <span className="text-[11px] text-text-muted">
            * Mathematical variances only; does not imply fraud.
          </span>
        </div>

        {!unusualFindings.hasSufficientData ? (
          <div className="p-6 rounded-2xl bg-card border border-border text-center text-xs text-text-muted">
            {unusualFindings.message}
          </div>
        ) : unusualFindings.detections.length === 0 ? (
          <div className="p-6 rounded-2xl bg-card border border-border text-center text-xs text-text-muted">
            All recorded expenses in this cycle align comfortably with cycle baseline averages.
          </div>
        ) : (
          <div className="space-y-2.5">
            {unusualFindings.detections.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-2xl bg-card border border-border hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-left"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary text-sm">{d.target}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-secondary border border-primary/20">
                      {d.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        d.severity === 'Alert'
                          ? 'text-danger bg-danger/10 border-danger/30'
                          : 'text-warning bg-warning/10 border-warning/30'
                      }`}
                    >
                      {d.severity}
                    </span>
                  </div>

                  <p className="text-text-secondary text-[11px]">
                    <strong>Rule:</strong> {d.rule} • <strong>Baseline:</strong> {d.baseline}
                  </p>

                  <p className="text-[11px] text-text-muted">
                    💡 <em>Action:</em> {d.suggestedAction}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-text-muted block">Transaction Amount</span>
                  <span className="text-base font-extrabold text-danger">
                    {formatINR(d.actualAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Month-over-Month Comparison Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Month-over-Month Spending Comparison
            </h2>
          </div>
          <span className="text-xs text-text-muted">
            {momComparison.hasComparison
              ? `${momComparison.currentPeriod.label} vs ${momComparison.previousPeriod.label}`
              : 'Cycle Comparison'}
          </span>
        </div>

        {!momComparison.hasComparison ? (
          <div className="p-6 rounded-2xl bg-card border border-border text-center text-xs text-text-muted">
            {momComparison.message}
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-card space-y-4">
            {/* MoM Comparison KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-background border border-border text-xs">
              <div>
                <span className="text-text-muted text-[10px] block">
                  {momComparison.currentPeriod.label} Outflow
                </span>
                <span className="text-lg font-extrabold text-text-primary">
                  {formatINR(momComparison.currentTotal)}
                </span>
              </div>
              <div>
                <span className="text-text-muted text-[10px] block">
                  {momComparison.previousPeriod.label} Outflow
                </span>
                <span className="text-lg font-extrabold text-text-secondary">
                  {formatINR(momComparison.prevTotal)}
                </span>
              </div>
              <div>
                <span className="text-text-muted text-[10px] block">Net Difference</span>
                <span
                  className={`text-lg font-extrabold ${
                    momComparison.absoluteDiff > 0
                      ? 'text-danger'
                      : momComparison.absoluteDiff < 0
                      ? 'text-success'
                      : 'text-text-primary'
                  }`}
                >
                  {momComparison.absoluteDiff >= 0 ? '+' : ''}
                  {formatINR(momComparison.absoluteDiff)}
                </span>
              </div>
              <div>
                <span className="text-text-muted text-[10px] block">Variance</span>
                <span
                  className={`text-lg font-extrabold ${
                    momComparison.percentChange > 0
                      ? 'text-danger'
                      : momComparison.percentChange < 0
                      ? 'text-success'
                      : 'text-text-primary'
                  }`}
                >
                  {momComparison.percentChange >= 0 ? '+' : ''}
                  {momComparison.percentChange}%
                </span>
              </div>
            </div>

            {/* Category Variance Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Increased Spending Categories */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5 text-danger">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Increased Spending Envelopes ({momComparison.increasedCategories.length})
                </h4>
                {momComparison.increasedCategories.length === 0 ? (
                  <p className="text-xs text-text-muted italic p-3 rounded-xl bg-background border border-border">
                    No categories had higher spending this cycle.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {momComparison.increasedCategories.map((c) => (
                      <div
                        key={c.category}
                        className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-text-primary">{c.category}</span>
                          <span className="text-text-muted text-[10px] block">
                            {formatINR(c.previous)} ➔ {formatINR(c.current)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-danger block">+{formatINR(c.diff)}</span>
                          <span className="text-[10px] text-danger">+{c.percentChange}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Decreased Spending Categories */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5 text-success">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  Reduced Spending Envelopes ({momComparison.decreasedCategories.length})
                </h4>
                {momComparison.decreasedCategories.length === 0 ? (
                  <p className="text-xs text-text-muted italic p-3 rounded-xl bg-background border border-border">
                    No categories reduced spending this cycle.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {momComparison.decreasedCategories.map((c) => (
                      <div
                        key={c.category}
                        className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-text-primary">{c.category}</span>
                          <span className="text-text-muted text-[10px] block">
                            {formatINR(c.previous)} ➔ {formatINR(c.current)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-success block">{formatINR(c.diff)}</span>
                          <span className="text-[10px] text-success">{c.percentChange}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AISpendingAnalyzer
