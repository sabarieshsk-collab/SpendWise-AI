import React from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import PlaceholderPage from '../components/common/PlaceholderPage'

export const Settings = () => {
  return (
    <PlaceholderPage
      title="Settings"
      subtitle="Account preferences, security parameters, currency standards, and AI behavior."
      category="System & Preferences"
      icon={SettingsIcon}
      features={[
        'Base currency selection (USD, EUR, GBP, INR, etc.) and locale formatting',
        'Dark fintech theme and UI density customization',
        'Security: Two-factor authentication (2FA) and active session management',
        'Data privacy, export controls, and AI model personality tuning',
      ]}
    />
  )
}

export default Settings
