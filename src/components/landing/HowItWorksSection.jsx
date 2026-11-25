import React from 'react'
import { PlusCircle, BrainCircuit, BellRing, ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Track Your Money',
    description: 'Add income, expenses, budgets, loans and subscriptions. SpendWise AI organizes your monetary records into clean, structured categories.',
    icon: PlusCircle,
    color: 'from-blue-500/20 to-primary/20 text-blue-400',
    highlight: 'Comprehensive Record Input',
  },
  {
    number: '02',
    title: 'Understand Your Finances',
    description: 'Let AI analyse your financial information and explain spending patterns. Gain actionable insights on unnecessary recurring charges and cash reserves.',
    icon: BrainCircuit,
    color: 'from-primary/20 to-secondary/20 text-secondary',
    highlight: 'Machine Intelligence Diagnostics',
  },
  {
    number: '03',
    title: 'Stay Ahead with Automation',
    description: 'Receive reminders, budget alerts and financial summaries through automated workflows. Never miss an EMI, subscription renewal, or limit breach.',
    icon: BellRing,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
    highlight: 'Autonomous Workflow Execution',
  },
]

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-primary/15 px-3 py-1 rounded-full border border-primary/20">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Your Financial Journey in Three Simple Steps
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            SpendWise AI removes complexity from budgeting and money management. No convoluted spreadsheets or stressful math.
          </p>
        </div>

        {/* Steps Grid (Horizontal on Desktop, Vertical on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line on Desktop */}
          <div className="hidden md:block absolute top-1/3 left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-primary/30 via-secondary/40 to-emerald-500/30 -z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl bg-card/90 border border-border backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-card hover:-translate-y-1"
              >
                {/* Step Number Badge */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sidebar to-card border border-border flex items-center justify-center font-mono font-bold text-base text-secondary shadow-soft mb-6">
                  {step.number}
                </div>

                {/* Icon Circle */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} border border-white/5 flex items-center justify-center mb-5 shadow-sm`}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Step Title */}
                <h3 className="text-xl font-bold text-text-primary mb-3 tracking-tight">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Feature Highlight Pill */}
                <div className="mt-auto pt-4 border-t border-border/60 w-full">
                  <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                    {step.highlight}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
