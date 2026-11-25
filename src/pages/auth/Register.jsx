import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../../components/common/Logo'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  X,
  PieChart,
  Zap,
  TrendingUp,
} from 'lucide-react'

export const Register = () => {
  const navigate = useNavigate()
  const { register, isAuthenticated, authError, setAuthError } = useAuth()

  // Form input states
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  // Visibility toggle states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validation & interaction states
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [showTermsModal, setShowTermsModal] = useState(false)

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      if (setAuthError) setAuthError(null)
    }
  }, [setAuthError])

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-border', percent: 0 }

    let score = 0
    if (pass.length >= 6) score += 1
    if (pass.length >= 8) score += 1
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1

    if (score <= 2) {
      return { score: 1, label: 'Weak', color: 'bg-danger', percent: 25, textColor: 'text-danger' }
    }
    if (score === 3 || score === 4) {
      return { score: 2, label: 'Fair', color: 'bg-warning', percent: 50, textColor: 'text-warning' }
    }
    if (score === 5) {
      return { score: 3, label: 'Good', color: 'bg-sky-400', percent: 75, textColor: 'text-sky-400' }
    }
    return { score: 4, label: 'Strong', color: 'bg-success', percent: 100, textColor: 'text-success' }
  }

  const strength = getPasswordStrength(password)

  // Validate form inputs
  const validate = () => {
    const errs = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // Full Name
    if (!fullName.trim()) {
      errs.fullName = 'Full name is required.'
    } else if (fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters.'
    }

    // Email
    if (!email.trim()) {
      errs.email = 'Email address is required.'
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. name@domain.com).'
    }

    // Password requirements
    if (!password) {
      errs.password = 'Password is required.'
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters long.'
    }

    // Confirm Password
    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm password cannot be empty.'
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match.'
    }

    // Terms
    if (!agreeTerms) {
      errs.agreeTerms = 'You must accept the Terms and Conditions before continuing.'
    }

    return errs
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const validationErrors = validate()
    setErrors(validationErrors)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (setAuthError) setAuthError(null)

    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
    })

    const validationErrors = validate()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsLoading(true)
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between selection:bg-primary/30 selection:text-white">
      {/* Top Header / Back Navigation */}
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
          <span className="hidden sm:inline">Protected Environment</span>
        </div>
      </header>

      {/* Main Two-Column Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Branding, Value Proposition & Financial Illustration (Desktop) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="space-y-3">
              <Logo size="lg" to="/" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-secondary text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personal Finance Co-Pilot</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
                Start Your Smarter{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-indigo-300">
                  Financial Journey.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-lg">
                Create your SpendWise AI account and take control of your income, expenses, budgets and savings goals.
              </p>
            </div>

            {/* Decorative Financial Illustration Cards */}
            <div className="hidden sm:block rounded-2xl bg-card border border-border p-5 space-y-4 shadow-xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-primary/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Platform Capabilities Ready For You
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-secondary border border-primary/30">
                  INSTITUTIONAL GRADE
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-background/80 border border-border flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-secondary shrink-0">
                    <PieChart className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary block">Dynamic 50/80/100% Envelopes</span>
                    <span className="text-[10px] text-text-muted">Proactive warnings before exceeding category spending limits.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-background/80 border border-border flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center text-success shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary block">Automated Wealth Goals</span>
                    <span className="text-[10px] text-text-muted">Compound emergency fund growth and milestone projections.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-background/80 border border-border flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary block">Conversational AI Queries</span>
                    <span className="text-[10px] text-text-muted">Ask questions in plain English and receive instant explanations.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-text-muted">
                <span>Safe & Secure Experience</span>
                <span className="text-secondary font-medium">Smart Money. Smarter Decisions.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Polished Registration Form Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
            <div className="rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-card backdrop-blur-xl space-y-6">
              {/* Form Title */}
              <div className="space-y-1.5 text-left">
                <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                  Create an Account
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Join SpendWise AI to experience autonomous financial clarity.
                </p>
              </div>

              {/* Server / Auth Error Banner */}
              {(formError || authError) && (
                <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 flex items-start gap-2.5 text-left animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                  <div className="text-xs text-danger font-medium leading-relaxed">
                    {formError || authError}
                  </div>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
                {/* 1. Full Name Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="full-name"
                    className="block text-xs font-semibold text-text-secondary"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-text-muted absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="full-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value)
                        if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }))
                        if (formError) setFormError(null)
                      }}
                      onBlur={() => handleBlur('fullName')}
                      placeholder="Alex Morgan"
                      className={`w-full bg-background border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors ${
                        touched.fullName && errors.fullName
                          ? 'border-danger focus:ring-1 focus:ring-danger'
                          : 'border-border focus:border-primary/60 focus:ring-1 focus:ring-primary/40'
                      }`}
                    />
                  </div>
                  {touched.fullName && errors.fullName && (
                    <div className="flex items-center gap-1.5 text-xs text-danger pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.fullName}</span>
                    </div>
                  )}
                </div>

                {/* 2. Email Address Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-text-secondary"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email) setErrors((prev) => ({ ...prev, email: null }))
                        if (formError) setFormError(null)
                      }}
                      onBlur={() => handleBlur('email')}
                      placeholder="alex.morgan@domain.com"
                      className={`w-full bg-background border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors ${
                        touched.email && errors.email
                          ? 'border-danger focus:ring-1 focus:ring-danger'
                          : 'border-border focus:border-primary/60 focus:ring-1 focus:ring-primary/40'
                      }`}
                    />
                  </div>
                  {touched.email && errors.email && (
                    <div className="flex items-center gap-1.5 text-xs text-danger pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* 3. Password Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-text-secondary"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) setErrors((prev) => ({ ...prev, password: null }))
                        if (formError) setFormError(null)
                      }}
                      onBlur={() => handleBlur('password')}
                      placeholder="Minimum 6 characters"
                      className={`w-full bg-background border rounded-xl pl-10 pr-11 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors ${
                        touched.password && errors.password
                          ? 'border-danger focus:ring-1 focus:ring-danger'
                          : 'border-border focus:border-primary/60 focus:ring-1 focus:ring-primary/40'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-2.5 p-1 rounded-md text-text-muted hover:text-text-primary transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Password Strength:</span>
                        <span className={`font-semibold ${strength.textColor}`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5 overflow-hidden flex gap-1">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            strength.score >= 1 ? strength.color : 'bg-transparent'
                          }`}
                          style={{ width: '25%' }}
                        />
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            strength.score >= 2 ? strength.color : 'bg-transparent'
                          }`}
                          style={{ width: '25%' }}
                        />
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            strength.score >= 3 ? strength.color : 'bg-transparent'
                          }`}
                          style={{ width: '25%' }}
                        />
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            strength.score >= 4 ? strength.color : 'bg-transparent'
                          }`}
                          style={{ width: '25%' }}
                        />
                      </div>
                    </div>
                  )}

                  {touched.password && errors.password && (
                    <div className="flex items-center gap-1.5 text-xs text-danger pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                {/* 4. Confirm Password Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-semibold text-text-secondary"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (errors.confirmPassword) {
                          setErrors((prev) => ({ ...prev, confirmPassword: null }))
                        }
                        if (formError) setFormError(null)
                      }}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="Repeat your password"
                      className={`w-full bg-background border rounded-xl pl-10 pr-11 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors ${
                        touched.confirmPassword && errors.confirmPassword
                          ? 'border-danger focus:ring-1 focus:ring-danger'
                          : 'border-border focus:border-primary/60 focus:ring-1 focus:ring-primary/40'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      className="absolute right-3 top-2.5 p-1 rounded-md text-text-muted hover:text-text-primary transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <div className="flex items-center gap-1.5 text-xs text-danger pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>

                {/* 5. Terms & Conditions Checkbox */}
                <div className="space-y-1 pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked)
                        if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: null }))
                      }}
                      className="w-4 h-4 mt-0.5 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background accent-primary cursor-pointer shrink-0"
                    />
                    <span className="text-xs text-text-secondary leading-relaxed">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowTermsModal(true)
                        }}
                        className="text-secondary hover:underline font-medium"
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowTermsModal(true)
                        }}
                        className="text-secondary hover:underline font-medium"
                      >
                        Privacy Policy
                      </button>
                      .
                    </span>
                  </label>
                  {touched.agreeTerms && errors.agreeTerms && (
                    <div className="flex items-center gap-1.5 text-xs text-danger pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.agreeTerms}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  className="w-full mt-2 shadow-lg shadow-primary/20 hover:shadow-primary/35"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account Profile...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Bottom Sign In Link */}
              <div className="pt-4 border-t border-border/70 text-center text-xs text-text-secondary">
                Already have a SpendWise AI account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-secondary hover:text-primary transition-colors hover:underline"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Terms & Conditions Informational Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-left">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                <h3 className="text-base font-bold text-text-primary">Terms of Service & Privacy</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-text-secondary space-y-3 max-h-64 overflow-y-auto pr-1 leading-relaxed">
              <p>
                <strong>1. Informational & Budgeting Purpose:</strong> SpendWise AI is designed as a personal expense management and forecasting assistant. The platform does not hold funds, initiate money transfers, or act as a banking entity.
              </p>
              <p>
                <strong>2. Privacy-First Principles:</strong> Your financial inputs are intended for your personal organization and analytical breakdown. We do not sell or monetize personal financial details.
              </p>
              <p>
                <strong>3. Data Security:</strong> Passwords are cryptographically salted and hashed using bcrypt before persistent storage. Sensitive credentials are never exposed in responses.
              </p>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAgreeTerms(true)
                  setShowTermsModal(false)
                  if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: null }))
                }}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-xs text-text-muted border-t border-border/40">
        SpendWise AI © {new Date().getFullYear()} – Smart Financial Assistant.
      </footer>
    </div>
  )
}

export default Register
