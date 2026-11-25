/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B1020',
        sidebar: '#10172A',
        card: '#151E33',
        'card-hover': '#1B2742',
        border: '#1E293B',
        'border-focus': '#8B5CF6',
        primary: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          light: '#A78BFA',
          muted: 'rgba(139, 92, 246, 0.15)',
        },
        secondary: {
          DEFAULT: '#A78BFA',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        success: {
          DEFAULT: '#22C55E',
          muted: 'rgba(34, 197, 94, 0.15)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          muted: 'rgba(245, 158, 11, 0.15)',
        },
        danger: {
          DEFAULT: '#EF4444',
          muted: 'rgba(239, 68, 68, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
        'glow-primary': '0 0 20px rgba(139, 92, 246, 0.25)',
        'card': '0 4px 24px -1px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
