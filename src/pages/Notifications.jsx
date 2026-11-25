import React from 'react'
import { Bell } from 'lucide-react'
import PlaceholderPage from '../components/common/PlaceholderPage'

export const Notifications = () => {
  return (
    <PlaceholderPage
      title="Notifications Center"
      subtitle="Audit log of system alerts, budget limits, AI anomalies, and transaction triggers."
      category="Alerts & Activity"
      icon={Bell}
      features={[
        'Configurable push and in-app alert thresholds',
        'Filterable audit log by Critical, Warning, AI Insight, and System',
        'Mark all as read and alert notification priority rules',
        'Email and SMS digest notification preferences',
      ]}
    />
  )
}

export default Notifications
