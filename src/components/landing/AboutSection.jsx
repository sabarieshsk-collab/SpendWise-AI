import React from 'react'
import {
  Wallet,
  BrainCircuit,
  TrendingUp,
  Zap,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react'

const pillars = [
  {
    title: 'Personal Financial Management',
    description: 'A disciplined, structured foundation designed to record income sources, track multi-category expenditures, establish envelope budgets, and track progress toward life milestones.',
    icon: Wallet,
    color: 'from-blue-500/20 to-primary/20 text-blue-400',
  },
  {
    title: 'Generative AI & Large Language Models',
    description: 'Conversational financial intelligence that transforms complex transaction figures into plain-English advice. Ask questions, explore scenarios, and receive contextual explanations.',
    icon: BrainCircuit,
    color: 'from-primary/20 to-secondary/20 text-secondary',
  },
  {
    title: 'Intelligent Spending Analysis',
    description: 'Algorithmic diagnostics that continuously analyze expenditure patterns, detect merchant cost creeps, compare discretionary vs. essential outlays, and highlight realistic surplus opportunities.',
    icon: TrendingUp,
    color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400',
  },
  {
    title: 'Workflow Automation',
    description: 'Proactive event-driven triggers designed to dispatch timely advance reminders for upcoming loan EMIs, subscription renewals, and 50%/80%/100% budget threshold alerts.',
    icon: Zap,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
  },
]

export const AboutSection = () => {
  return (
    <section id="about" className="py-20 md:py-28 bg-sidebar/50 border-t border-border/80 relative overflow-hidden">
      {/* Decorative Blur Accent */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-secondary text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Our Core Mission</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
            Making Personal Finance Smarter
          </h2>

          <p className="text-base text-text-secondary leading-relaxed">
            Managing personal money shouldn’t require complex manual spreadsheets or dry banking tables. SpendWise AI brings together four modern architectural pillars to deliver clarity, control, and foresight.
          </p>
        </div>

        {/* 4 Architectural Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <div
                key={idx}
                className="rounded-2xl bg-card border border-border p-6 sm:p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-card hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.color} border border-white/5 flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-xs text-text-muted">Pillar 0{idx + 1}</span>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary mb-2.5 tracking-tight">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-text-secondary leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
                  <span>Engine Module</span>
                  <span className="text-secondary font-medium">Integrated Design</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Value Proposition Philosophy Callout */}
        <div className="rounded-2xl bg-gradient-to-r from-background via-sidebar to-card border border-border p-6 sm:p-8 text-center max-w-4xl mx-auto space-y-3">
          <h4 className="text-base font-bold text-text-primary">
            Built for Transparency and Scalability
          </h4>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl mx-auto">
            SpendWise AI is engineered as an intelligent assistant, not a financial middleman. The platform aims to illuminate your cash flow, identify actionable savings, and automate reminders without touching your actual bank funds.
          </p>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
