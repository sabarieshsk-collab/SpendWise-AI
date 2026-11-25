import React from 'react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Sparkles, Construction, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export const PlaceholderPage = ({
  title,
  subtitle,
  category = 'Module In Development',
  icon: Icon = Construction,
  features = [],
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" dot size="sm">
              {category}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Main Preview Card */}
      <Card className="relative overflow-hidden border border-border/80 bg-card">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center py-12 px-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-secondary mb-4 shadow-soft">
            <Icon className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {title} Module Ready for Implementation
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            The foundation for {title} is configured in the SpendWise AI architecture. Layout, navigation, design tokens and routes are linked.
          </p>

          {features.length > 0 && (
            <div className="w-full text-left bg-background/60 border border-border rounded-lg p-4 mb-6">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                Planned Capabilities
              </span>
              <ul className="space-y-2 text-xs text-text-secondary">
                {features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-xs font-medium text-text-primary hover:bg-card-hover transition-colors"
            >
              Back to Overview
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default PlaceholderPage
