import React from 'react'
import LandingNavbar from '../components/landing/LandingNavbar'
import HeroSection from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import AIPoweredSection from '../components/landing/AIPoweredSection'
import AutomationSection from '../components/landing/AutomationSection'
import DedicatedDashboardSection from '../components/landing/DedicatedDashboardSection'
import AboutSection from '../components/landing/AboutSection'
import FAQSection from '../components/landing/FAQSection'
import LandingFooter from '../components/landing/LandingFooter'

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary/30 selection:text-white flex flex-col font-sans">
      {/* Sticky Navigation Bar */}
      <LandingNavbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section with Interactive Dashboard Preview */}
        <HeroSection />

        {/* 2. 9 Comprehensive Feature Cards */}
        <FeaturesSection />

        {/* 3. Three-Step Process Walkthrough */}
        <HowItWorksSection />

        {/* 4. AI-Powered Capabilities & Interactive Chat Demonstration */}
        <AIPoweredSection />

        {/* 5. Workflow Automation & Reminders Showcase */}
        <AutomationSection />

        {/* 6. Dedicated Comprehensive Dashboard Preview Section */}
        <DedicatedDashboardSection />

        {/* 7. Dedicated About Section: Making Personal Finance Smarter */}
        <AboutSection />

        {/* 8. Interactive FAQ Section (7 Questions) */}
        <FAQSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}

export default Landing
