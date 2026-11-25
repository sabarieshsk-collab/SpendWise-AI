import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '../../components/common/Logo'
import { Button } from '../../components/ui/Button'
import {
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  Info,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

export const ForgotPassword = () => {
  const navigate = useNavigate()

  // State management
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  // Email validation rule
  const validateEmail = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!val.trim()) {
      return 'Email address is required.'
    }
    if (!emailRegex.test(val.trim())) {
      return 'Please enter a valid email address (e.g. name@domain.com).'
    }
    return ''
  }

  const handleBlur = () => {
    setTouched(true)
    setError(validateEmail(email))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    const validationError = validateEmail(email)
    setError(validationError)

    if (validationError) {
      return
    }

    // Client-side demonstration recovery flow
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setSubmittedEmail(email.trim())
      setIsSubmitted(true)
    }, 1100)
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setEmail('')
    setError('')
    setTouched(false)
  }

  const handleQuickFill = () => {
    setEmail('alex.morgan@spendwise.ai')
    setError('')
    setTouched(false)
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between selection:bg-primary/30 selection:text-white font-sans">
      {/* Top Header / Navigation */}
      <header className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <ShieldCheck className="w-4 h-4 text-secondary" />
          <span className="hidden sm:inline">Protected Recovery Flow</span>
        </div>
      </header>

      {/* Main Centered Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="max-w-md w-full"
        >
          <div className="rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-card backdrop-blur-xl space-y-6 text-center relative overflow-hidden">
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/15 rounded-full blur-2xl pointer-events-none" />

            {/* Brand Logo & Lock Illustration */}
            <div className="flex flex-col items-center space-y-4">
              <Logo size="default" to="/" />

              <div className="relative mt-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-sidebar border border-primary/30 flex items-center justify-center text-secondary shadow-soft">
                  <KeyRound className="w-7 h-7" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                  Forgot Your Password?
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
                  No worries. Enter your registered email address and we'll guide you through the password recovery process.
                </p>
              </div>
            </div>

            {!isSubmitted ? (
              /* Recovery Request Form */
              <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left pt-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="recovery-email"
                    className="block text-xs font-semibold text-text-secondary"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="recovery-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError('')
                      }}
                      onBlur={handleBlur}
                      placeholder="alex.morgan@domain.com"
                      className={`w-full bg-background border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors ${
                        touched && error
                          ? 'border-danger focus:ring-1 focus:ring-danger'
                          : 'border-border focus:border-primary/60 focus:ring-1 focus:ring-primary/40'
                      }`}
                    />
                  </div>
                  {touched && error && (
                    <div className="flex items-center gap-1.5 text-xs text-danger pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Quick-fill helper for demonstration testing */}
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[11px] font-medium text-text-muted hover:text-secondary transition-colors"
                  >
                    Use Sample Email
                  </button>
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/35"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Request...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              /* Demonstration Recovery Notice */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-left pt-2"
              >
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">
                        Demonstration Notice
                      </h4>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Real password recovery emails and automated reset links will be implemented during backend development. In adherence to privacy best practices, this platform does not reveal whether{' '}
                        <strong className="text-text-primary font-mono">{submittedEmail}</strong> belongs to an active account, nor are reset tokens generated at this stage.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Link to="/login" className="w-full">
                    <Button variant="primary" size="md" className="w-full">
                      Return to Sign In
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-text-secondary hover:text-text-primary flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Another Email Address</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Back to Login Footer Navigation */}
            <div className="pt-4 border-t border-border/70 text-center text-xs text-text-secondary">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-semibold text-secondary hover:text-primary transition-colors hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-xs text-text-muted border-t border-border/40">
        SpendWise AI © {new Date().getFullYear()} – Smart Financial Assistant. Demonstration environment.
      </footer>
    </div>
  )
}

export default ForgotPassword
