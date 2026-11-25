import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../common/Logo'
import { ShieldCheck } from 'lucide-react'

export const LandingFooter = () => {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-sidebar/95 border-t border-border/80 pt-16 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-border/60">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="default" showTagline to={null} />
            <p className="text-xs sm:text-sm text-text-secondary max-w-sm leading-relaxed mt-2">
              Next-generation personal financial intelligence platform. Designed to combine personal financial management, generative language models, intelligent spending analysis, and workflow automation.
            </p>
            <div className="flex items-center gap-2 text-xs text-text-muted pt-2">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span>Designed with privacy-first and zero-transfer principles</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <button
                  onClick={() => scrollTo('home')}
                  className="hover:text-text-primary transition-colors focus:outline-none"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('features')}
                  className="hover:text-text-primary transition-colors focus:outline-none"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('how-it-works')}
                  className="hover:text-text-primary transition-colors focus:outline-none"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('dashboard-preview')}
                  className="hover:text-text-primary transition-colors focus:outline-none"
                >
                  Dashboard Preview
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('about')}
                  className="hover:text-text-primary transition-colors focus:outline-none"
                >
                  About SpendWise
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('faq')}
                  className="hover:text-text-primary transition-colors focus:outline-none"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Access & Authentication */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Access & Account
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <Link to="/login" className="hover:text-text-primary transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-text-primary transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:text-text-primary transition-colors">
                  Password Recovery
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>
            © {new Date().getFullYear()} SpendWise AI. All rights reserved. Smart Money. Smarter Decisions.
          </p>
          <p className="text-[11px] text-text-muted text-center sm:text-right">
            Demonstration preview. SpendWise AI does not process payments or initiate fund transfers.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default LandingFooter
