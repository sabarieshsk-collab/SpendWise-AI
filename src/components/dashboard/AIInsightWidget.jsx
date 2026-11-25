import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, TrendingDown, Lightbulb, ArrowRight, Bot, CheckCircle2 } from 'lucide-react'

export const AIInsightWidget = () => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-card via-card to-sidebar border border-primary/30 p-5 sm:p-6 shadow-card space-y-4 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary tracking-tight">
              AI Financial Co-Pilot
            </h3>
            <span className="text-[10px] text-secondary font-semibold">Autonomous Intelligence Briefing</span>
          </div>
        </div>

        <Link
          to="/ai-assistant"
          className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1"
        >
          <span>Ask Co-Pilot</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Insight Items */}
      <div className="space-y-3">
        {/* Insight 1: Spending Anomaly */}
        <div className="p-3.5 rounded-xl bg-background/80 border border-border/80 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-text-primary">
              <TrendingDown className="w-3.5 h-3.5 text-success" />
              <span>Dining Out Optimization Detected</span>
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-success/15 text-success">
              +₹4,200 SURPLUS
            </span>
          </div>
          <p className="text-text-secondary leading-relaxed">
            Your dining out expenses dropped 18% compared to the prior 3-week average. Allocate this surplus directly to your Emergency Reserve to reach 80% completion early.
          </p>
        </div>

        {/* Insight 2: Subscription Leak */}
        <div className="p-3.5 rounded-xl bg-background/80 border border-border/80 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-text-primary">
              <Lightbulb className="w-3.5 h-3.5 text-warning" />
              <span>Duplicate Streaming Subscriptions</span>
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-warning/15 text-warning">
              ACTION SUGGESTED
            </span>
          </div>
          <p className="text-text-secondary leading-relaxed">
            SpendWise detected overlapping media passes (₹649 + ₹899). Consolidating into an annual family plan could save up to ₹4,800 annually.
          </p>
        </div>
      </div>

      {/* Bottom Health Indicator */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
        <span className="flex items-center gap-1 text-success">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Overall Portfolio Health Score: 94/100 (Optimal)</span>
        </span>
        <span className="text-[10px] text-text-muted">Updated: Today, 10:45 AM</span>
      </div>
    </div>
  )
}

export default AIInsightWidget
