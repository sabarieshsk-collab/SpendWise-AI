import React from 'react'
import { BarChart3 } from 'lucide-react'
import PlaceholderPage from '../components/common/PlaceholderPage'

export const FinancialReports = () => {
  return (
    <PlaceholderPage
      title="Financial Reports"
      subtitle="Executive summary statements, cash-flow reports, and tax readiness exports."
      category="Insights & Analytics"
      icon={BarChart3}
      features={[
        'Comprehensive Monthly / Quarterly / Annual Financial Statements',
        'P&L (Profit and Loss) and Cash Flow breakdown charts',
        'Downloadable audit-ready PDF / Excel / CSV summaries',
        'Tax category classification and deduction candidate report',
      ]}
    />
  )
}

export default FinancialReports
