import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import DashboardPreview from './DashboardPreview'
import { ArrowRight, Sparkles, Shield, CheckCircle2, ChevronRight } from 'lucide-react'

export const HeroSection = () => {
  const scrollToFeatures = () => {
    const el = document.getElementById('features')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      {/* Background Lighting Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-secondary text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
              <span>Next-Gen Personal Finance Powered by AI</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.12]">
              Take Control of Your Money.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-indigo-300">
                Let AI Do the Thinking.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0">
              Manage expenses, plan budgets, track savings, monitor subscriptions and understand your financial future with your intelligent AI-powered financial assistant.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base shadow-lg shadow-primary/25 hover:shadow-primary/40"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Get Started
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={scrollToFeatures}
                className="w-full sm:w-auto text-base"
              >
                Explore Features
              </Button>
            </div>

            {/* Trust Indicator */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-xs text-text-muted border-t border-border/60">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <span className="inline-block w-5 h-5 rounded-full bg-primary ring-2 ring-background text-[9px] font-bold text-white text-center leading-5">A</span>
                  <span className="inline-block w-5 h-5 rounded-full bg-secondary ring-2 ring-background text-[9px] font-bold text-white text-center leading-5">S</span>
                  <span className="inline-block w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-background text-[9px] font-bold text-white text-center leading-5">M</span>
                </div>
                <span className="text-text-secondary font-medium">
                  Your smarter financial journey starts here.
                </span>
              </div>
              <div className="hidden sm:inline-block text-border">•</div>
              <div className="flex items-center gap-1.5 text-text-muted">
                <Shield className="w-3.5 h-3.5 text-secondary" />
                <span>Private & Secure Fintech Architecture</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Dashboard Preview */}
          <div className="lg:col-span-6 w-full">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
