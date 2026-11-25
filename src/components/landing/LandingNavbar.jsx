import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../common/Logo'
import { Button } from '../ui/Button'
import { Menu, X, ArrowRight } from 'lucide-react'

export const LandingNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navLinks = [
    { label: 'Home', action: () => scrollToSection('home') },
    { label: 'Features', action: () => scrollToSection('features') },
    { label: 'How It Works', action: () => scrollToSection('how-it-works') },
    { label: 'About', action: () => scrollToSection('about') },
    { label: 'FAQ', action: () => scrollToSection('faq') },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-border shadow-soft-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left: Brand Logo */}
          <div className="flex items-center">
            <button
              onClick={() => scrollToSection('home')}
              className="text-left focus:outline-none"
              aria-label="SpendWise AI Home"
            >
              <Logo size="default" to={null} />
            </button>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={link.action}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right: Authentication Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-card/95 backdrop-blur-xl border-b border-border px-5 py-6 space-y-4 animate-in fade-in duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={link.action}
                className="text-left py-2 text-base font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" className="w-full">
                Login
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default LandingNavbar
