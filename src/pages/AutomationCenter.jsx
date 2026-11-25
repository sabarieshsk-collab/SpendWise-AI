import React from 'react'
import { Zap } from 'lucide-react'
import PlaceholderPage from '../components/common/PlaceholderPage'

export const AutomationCenter = () => {
  return (
    <PlaceholderPage
      title="Automation Center"
      subtitle="Smart triggers, automated category assignments, and rules engine."
      category="Workflow Automation"
      icon={Zap}
      features={[
        'Custom if-this-then-that rule creation for recurring transaction labeling',
        'Auto-transfer simulation to high-yield savings pots on payday',
        'Scheduled recurring reporting and automated backup routines',
        'Webhook and external notification dispatch channels',
      ]}
    />
  )
}

export default AutomationCenter
