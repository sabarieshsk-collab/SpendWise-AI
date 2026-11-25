import React, { useState } from 'react'
import {
  Sparkles,
  Bot,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Cpu,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { MarkdownRenderer } from '../common/MarkdownRenderer'

export const AISpendingReport = ({
  aiAnalysis,
  isAnalyzing,
  aiError,
  aiModel,
  lastAnalyzed,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!aiAnalysis) return
    navigator.clipboard.writeText(aiAnalysis)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-card space-y-4 text-left relative overflow-hidden">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/20 text-secondary border border-primary/40 flex items-center justify-center shadow-inner shrink-0">
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-text-primary tracking-tight">
                AI Financial Diagnostic & Strategic Insights
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-secondary border border-primary/30 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {aiModel || 'NVIDIA Nemotron 3 Ultra'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live OpenRouter
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Deep reasoning synthesis of category outlays, velocity anomalies, and actionable savings runway.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {aiAnalysis && !isAnalyzing && (
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-xl bg-sidebar border border-border text-xs text-text-secondary hover:text-text-primary hover:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy analysis report"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-[11px]">Copy Report</span>
                </>
              )}
            </button>
          )}

          {lastAnalyzed && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-text-muted pl-1">
              <Clock className="w-3 h-3" />
              <span>{lastAnalyzed}</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="py-10 px-4 rounded-xl bg-sidebar/40 border border-border text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 text-secondary animate-pulse">
            <Bot className="w-6 h-6 animate-bounce" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-sm font-bold text-text-primary">
              Synthesizing Spending Metrics with {aiModel || 'NVIDIA Nemotron 3 Ultra'}...
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Evaluating spending velocity, envelope limits, and statistical anomaly variances from verified ledger transactions.
            </p>
          </div>
          <div className="w-48 h-1.5 bg-border rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-primary to-secondary animate-pulse rounded-full" />
          </div>
        </div>
      )}

      {/* Error State */}
      {!isAnalyzing && aiError && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-danger">AI Analysis Communication Notice</h4>
              <p className="text-xs text-text-secondary leading-relaxed">{aiError}</p>
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              iconPosition="left"
              onClick={onRetry}
              className="text-xs font-semibold py-1.5 px-3 bg-danger/20 hover:bg-danger/30 text-danger border-danger/30"
            >
              Retry AI Analysis
            </Button>
          </div>
        </div>
      )}

      {/* Content Rendered State with Dark Fintech Markdown */}
      {!isAnalyzing && !aiError && aiAnalysis && (
        <div className="space-y-3">
          <MarkdownRenderer content={aiAnalysis} />

          {/* Governance Notice Badge */}
          <div className="mt-4 pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-text-muted gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>
                <strong>SpendWise Governance:</strong> Grounded strictly in pre-calculated ledger balances. Anomalies represent statistical variances, not fraud.
              </span>
            </div>
            <span className="italic text-text-secondary">
              Savings opportunities are estimates.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AISpendingReport
