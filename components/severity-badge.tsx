import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Severity } from '@/lib/review-types'

const STYLES: Record<Severity, string> = {
  critical: 'bg-destructive/15 text-destructive border-destructive/30',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  low: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
  info: 'bg-secondary text-muted-foreground border-border',
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <Badge variant="outline" className={cn('capitalize', STYLES[severity])}>
      {severity}
    </Badge>
  )
}
