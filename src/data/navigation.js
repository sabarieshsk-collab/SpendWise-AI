import {
  LayoutDashboard,
  Receipt,
  PieChart,
  PiggyBank,
  Landmark,
  CreditCard,
  Bot,
  TrendingUp,
  BarChart3,
  Bell,
  Zap,
  Settings,
} from 'lucide-react'

export const NAVIGATION_ITEMS = [
  {
    group: 'Overview',
    items: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        id: 'transactions',
        name: 'Transactions',
        path: '/transactions',
        icon: Receipt,
      },
    ],
  },
  {
    group: 'Financial Management',
    items: [
      {
        id: 'budget',
        name: 'Budget Planner',
        path: '/budget',
        icon: PieChart,
      },
      {
        id: 'savings',
        name: 'Savings Goals',
        path: '/savings',
        icon: PiggyBank,
      },
      {
        id: 'loans',
        name: 'Loan Manager',
        path: '/loans',
        icon: Landmark,
      },
      {
        id: 'subscriptions',
        name: 'Subscription Manager',
        path: '/subscriptions',
        icon: CreditCard,
      },
    ],
  },
  {
    group: 'AI Intelligence',
    items: [
      {
        id: 'ai-assistant',
        name: 'AI Financial Assistant',
        path: '/ai-assistant',
        icon: Bot,
        badge: 'AI',
      },
      {
        id: 'spending-analyzer',
        name: 'AI Spending Analyzer',
        path: '/spending-analyzer',
        icon: TrendingUp,
        badge: 'Smart',
      },
    ],
  },
  {
    group: 'Insights & System',
    items: [
      {
        id: 'reports',
        name: 'Financial Reports',
        path: '/reports',
        icon: BarChart3,
      },
      {
        id: 'automation',
        name: 'Automation Center',
        path: '/automation',
        icon: Zap,
      },
      {
        id: 'notifications',
        name: 'Notifications',
        path: '/notifications',
        icon: Bell,
        badgeCount: 3,
      },
      {
        id: 'settings',
        name: 'Settings',
        path: '/settings',
        icon: Settings,
      },
    ],
  },
]
