import React from 'react'
import {
  Bot,
  Sparkles,
  MessageSquare,
  TrendingDown,
  Lightbulb,
  FileSpreadsheet,
  CheckCircle2,
  Send,
  User,
} from 'lucide-react'

const capabilities = [
  {
    title: 'Natural-language financial questions',
    description: 'Ask anything in plain conversational language—from your net savings to specific vendor expenses.',
    icon: MessageSquare,
  },
  {
    title: 'Personalized budget suggestions',
    description: 'Dynamic recommendations that adapt to your seasonal lifestyle shifts and income variations.',
    icon: Lightbulb,
  },
  {
    title: 'Spending pattern explanations',
    description: 'Understand the underlying "why" behind your spending peaks and discretionary leaks.',
    icon: TrendingDown,
  },
  {
    title: 'Savings recommendations',
    description: 'Concrete, low-impact adjustments designed to grow your reserve funds without lifestyle shock.',
    icon: Sparkles,
  },
  {
    title: 'Monthly financial summaries',
    description: 'Consolidated executive-level briefs delivering complete monetary clarity in under two minutes.',
    icon: FileSpreadsheet,
  },
]

export const AIPoweredSection = () => {
  return (
    <section id="ai-assistant" className="py-20 md:py-28 bg-sidebar/50 border-y border-border/80 relative overflow-hidden">
      {/* Decorative Gradient Background Elements */}
      <div className="absolute -top-32 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: AI Capabilities */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-secondary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
              <span>SpendWise Financial Intelligence Engine</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
              Meet Your Intelligent Financial Assistant
            </h2>

            <p className="text-base text-text-secondary leading-relaxed">
              Experience the power of an institutional-grade financial analyst in your pocket. Ask questions, audit habits, and uncover hidden savings effortlessly.
            </p>

            {/* List of capabilities */}
            <div className="space-y-4 pt-2 text-left">
              {capabilities.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="flex items-start gap-3.5 group">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-secondary shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">
                        {item.title}
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Decorative Chatbot Conversation Preview */}
          <div className="lg:col-span-6 w-full">
            <div className="rounded-2xl bg-card border border-border shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Chat Header */}
              <div className="p-4 bg-sidebar/90 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-sm">
                      <Bot className="w-5 h-5" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-card" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-text-primary">SpendWise AI Co-pilot</span>
                      <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-primary/20 text-secondary rounded">PRO</span>
                    </div>
                    <span className="text-[11px] text-text-secondary">Analyzing financial portfolio (Demo)</span>
                  </div>
                </div>

                <div className="px-2 py-1 rounded bg-white/5 border border-border text-[10px] font-mono text-text-muted">
                  STATIC DEMO
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-5 space-y-4 min-h-[340px] bg-background/50">
                {/* User Message */}
                <div className="flex items-start justify-end gap-2.5">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-white text-sm shadow-sm">
                    <p className="font-medium">How can I save ₹2,000 this month?</p>
                    <span className="text-[10px] text-white/70 block text-right mt-1">10:42 AM</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-text-primary shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                </div>

                {/* AI Assistant Message */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-card border border-border p-4 text-text-primary text-sm shadow-card space-y-3">
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Your recent spending indicates opportunities to reduce shopping and entertainment expenses. Review these categories to identify a realistic savings target:
                    </p>

                    {/* Breakdown Card */}
                    <div className="rounded-xl bg-background/80 border border-border/80 p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                        <span className="text-text-secondary">Online Shopping Spike</span>
                        <span className="font-semibold text-warning">₹1,400 surplus vs avg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary">Dining Out & Delivery</span>
                        <span className="font-semibold text-secondary">₹1,100 optimization target</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-success/10 border border-success/20 flex items-center gap-2 text-xs text-success">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Adjusting both categories allows you to comfortably save <strong>₹2,500</strong> this month!</span>
                    </div>

                    <span className="text-[10px] text-text-muted block text-right">SpendWise AI • Just now</span>
                  </div>
                </div>
              </div>

              {/* Chat Input Bar (Decorative Mock) */}
              <div className="p-3 bg-sidebar border-t border-border flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="What is my projected end-of-month cash reserve?"
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none cursor-not-allowed opacity-90"
                />
                <button
                  type="button"
                  disabled
                  className="p-2 rounded-lg bg-primary text-white opacity-80 cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-text-muted mt-3">
              * Demonstration preview. SpendWise AI does not make real external AI calls at this stage.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AIPoweredSection
