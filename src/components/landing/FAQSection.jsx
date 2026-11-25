import React, { useState } from 'react'
import { ChevronDown, HelpCircle, AlertCircle } from 'lucide-react'

const faqItems = [
  {
    id: 1,
    question: 'What is SpendWise AI?',
    answer:
      'SpendWise AI is an intelligent personal finance management platform designed to help individuals record income, track daily expenses, plan category budgets, monitor savings milestones, and gain clear financial insights through AI-assisted analysis.',
  },
  {
    id: 2,
    question: 'Can I track my income and expenses?',
    answer:
      'Yes. SpendWise AI allows you to log all income sources and categorize every expenditure. The platform visualizes your monthly cash flow, category breakdowns, and historical trends to give you complete visibility over where your money goes.',
  },
  {
    id: 3,
    question: 'How does the AI Financial Assistant work?',
    answer:
      'The AI Financial Assistant is designed to analyze your structured financial records using machine intelligence. You can ask natural-language questions (e.g., "How can I save ₹2,000 this month?") and receive clear explanations, anomaly alerts, and actionable suggestions tailored to your spending habits.',
  },
  {
    id: 4,
    question: 'Can I manage my loans and subscriptions?',
    answer:
      'Yes. SpendWise AI includes dedicated modules for managing loan portfolios—including principal vs. interest tracking—as well as monitoring recurring subscriptions, trial period expirations, and annual renewal calendars.',
  },
  {
    id: 5,
    question: 'Will I receive EMI and subscription reminders?',
    answer:
      'Yes. Through planned workflow automation, SpendWise AI is designed to dispatch advance reminders before loan EMI due dates, subscription renewals, and when category spending approaches configured budget thresholds (such as 50% progress, 80% warning, and 100% limit reached). These workflows are currently planned capabilities in the development roadmap.',
  },
  {
    id: 6,
    question: 'Does SpendWise AI make payments automatically?',
    answer:
      'No. SpendWise AI does not execute payments, initiate bank transfers, or move any funds. The platform operates strictly as an informational, analytical, and budgeting assistant to help you understand your finances and plan payments manually through your own banking institutions.',
  },
  {
    id: 7,
    question: 'Is my financial information secure?',
    answer:
      'Data privacy and security are foundational architectural requirements. SpendWise AI is being developed according to modern privacy-first standards. In this current project initialization and design preview stage, production authentication, cloud encryption, and live backend databases are planned in subsequent development phases. No real user financial credentials or banking logins are requested or stored at this stage.',
  },
]

export const FAQSection = () => {
  const [openIds, setOpenIds] = useState([1]) // First item expanded by default

  const toggleAccordion = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <section id="faq" className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 right-10 w-[450px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-secondary text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
            Frequently Asked Questions
          </h2>

          <p className="text-base text-text-secondary leading-relaxed">
            Everything you need to know about SpendWise AI, our planned automation, data safety principles, and platform capabilities.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqItems.map((item) => {
            const isOpen = openIds.includes(item.id)
            return (
              <div
                key={item.id}
                className="rounded-2xl bg-card border border-border overflow-hidden transition-all duration-200 hover:border-slate-700"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
                    {item.question}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-text-secondary shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-secondary border-primary/40' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-text-secondary leading-relaxed border-t border-border/60 pt-4 bg-background/40">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Important Clarity Callout */}
        <div className="mt-10 p-4 rounded-xl bg-sidebar/80 border border-border/80 flex items-start gap-3 text-xs text-text-secondary">
          <AlertCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          <p>
            <strong>Note on Capabilities:</strong> SpendWise AI is purely an analytical assistant for money planning and tracking. We never initiate transactions or hold customer deposits.
          </p>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
