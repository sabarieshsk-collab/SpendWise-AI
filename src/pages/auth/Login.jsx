import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Logo } from '../../components/common/Logo'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import {
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
  Wallet,
  TrendingUp,
} from 'lucide-react'

export const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, authError, setAuthError } = useAuth()

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Validation & interaction states
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState(null)

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // Clear errors when unmounting or changing inputs
  useEffect(() => {
    return () => {
      if (setAuthError) setAuthError(null)
    }
  }, [setAuthError])

  // Validate email and password
  const validate = () => {
    const errs = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email.trim()) {
      errs.email = 'Email address is required.'
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address (e.g., name@domain.com).'
    }

    if (!password) {
      errs.password = 'Password cannot be empty.'
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters long.'
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

    setTouched({ email: true, password: true })
    const validationErrors = validate()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsLoading(true)
    try {
      await login(email.trim(), password)
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (err) {
      setFormError(err.message || 'Authentication failed. Please verify your credentials.')
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
          {/* Left Column: Branding, Value Proposition & Financial Preview (Desktop) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="space-y-3">
              <Logo size="lg" to="/" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-secondary text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Financial Assistant</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
                Welcome Back to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-indigo-300">
                  Smarter Finance.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-lg">
                Log in to access your intelligent financial co-pilot. Track your cash flow, monitor real-time category budgets, and uncover actionable savings opportunities.
              </p>
            </div>

            {/* Decorative Financial Illustration / Mini Dashboard Widget */}
            <div className="hidden sm:block rounded-2xl bg-card border border-border p-5 space-y-4 shadow-xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-secondary">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-primary block">Personal Vault</span>
                    <span className="text-[10px] text-text-muted">Multi-User Financial Security</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/15 text-success border border-success/30">
                  SECURE & ENCRYPTED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-background/80 border border-border">
                  <span className="text-[11px] text-text-secondary block">Real-time Isolation</span>
                  <span className="text-lg font-bold text-text-primary mt-0.5 block">Isolated</span>
                  <span className="text-[10px] text-success flex items-center gap-1 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> Per-user ledger state
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-background/80 border border-border">
                  <span className="text-[11px] text-text-secondary block">Authentication</span>
                  <span className="text-lg font-bold text-secondary mt-0.5 block">JWT + Bcrypt</span>
                  <span className="text-[10px] text-text-muted mt-0.5 block">HttpOnly Cookie</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-sidebar/80 border border-border text-[11px] text-text-secondary flex items-center justify-between">
                <span>Enterprise grade password hashing (10 salt rounds)</span>
                <span className="text-secondary font-semibold">Active</span>
              </div>
            </div>

            {/* Small Brand Tagline */}
            <div className="pt-2 flex items-center gap-2 text-xs font-medium text-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>Smart Money. Smarter Decisions.</span>
            </div>
          </div>

          {/* Right Column: Polished Login Form */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
            <div className="rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-card backdrop-blur-xl space-y-6">
              {/* Form Header */}
              <div className="space-y-1.5 text-left">
                <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                  Sign In to Account
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Enter your registered credentials to access your personal dashboard.
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

              {/* Login Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email-address"
                    className="block text-xs font-semibold text-text-secondary"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="email-address"
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

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-text-secondary"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-secondary hover:text-primary transition-colors hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
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
                      placeholder="Enter your password"
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
                  {touched.password && errors.password && (
                    <div className="flex items-center gap-1.5 text-xs text-danger pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background accent-primary cursor-pointer"
                    />
                    <span className="text-xs text-text-secondary">Remember this device</span>
                  </label>
                </div>

                {/* Submit Login Button */}
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
                      <span>Authenticating Credentials...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Bottom Registration Link */}
              <div className="pt-4 border-t border-border/70 text-center text-xs text-text-secondary">
                Don't have a SpendWise AI account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-secondary hover:text-primary transition-colors hover:underline"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-xs text-text-muted border-t border-border/40">
        SpendWise AI © {new Date().getFullYear()} – Smart Financial Assistant.
      </footer>
    </div>
  )
}

export default Login
