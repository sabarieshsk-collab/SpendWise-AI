import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { FinanceProvider } from './context/FinanceContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'

// Public Pages
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// App Portal Pages
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import BudgetPlanner from './pages/BudgetPlanner'
import SavingsGoals from './pages/SavingsGoals'
import Loans from './pages/Loans'
import Subscriptions from './pages/Subscriptions'
const LoanManager = Loans
const SubscriptionManager = Subscriptions
import AIAssistant from './pages/AIAssistant'
import AIFinancialAssistant from './pages/AIFinancialAssistant'
import SpendingAnalyzer from './pages/SpendingAnalyzer'
import AISpendingAnalyzer from './pages/AISpendingAnalyzer'
import FinancialReports from './pages/FinancialReports'
import Notifications from './pages/Notifications'
import AutomationCenter from './pages/AutomationCenter'
import Settings from './pages/Settings'

export function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <BrowserRouter>
          <Routes>
            {/* Public & Authentication Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected App Layout Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budget" element={<BudgetPlanner />} />
                <Route path="/savings" element={<SavingsGoals />} />
                <Route path="/loans" element={<LoanManager />} />
                <Route path="/subscriptions" element={<SubscriptionManager />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/ai-financial-assistant" element={<AIFinancialAssistant />} />
                <Route path="/spending-analyzer" element={<SpendingAnalyzer />} />
                <Route path="/ai-spending-analyzer" element={<AISpendingAnalyzer />} />
                <Route path="/reports" element={<FinancialReports />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/automation" element={<AutomationCenter />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </FinanceProvider>
    </AuthProvider>
  )
}

export default App
