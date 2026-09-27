import { Badge, type BadgeTone } from '../../../shared/ui/Badge'
import type { DoctorStatus } from '../domain/doctor'

const statusDetails: Record<
  DoctorStatus,
  { label: string; tone: BadgeTone; color: string; foregroundColor: string }
> = {
  active: {
    label: 'Portal active',
    tone: 'success',
    color: 'var(--color-primary-soft)',
    foregroundColor: 'var(--color-primary-soft-foreground)',
  },
  pending: {
    label: 'Invite pending',
    tone: 'warning',
    color: 'var(--color-accent-soft)',
    foregroundColor: 'var(--color-accent-soft-foreground)',
  },
  inactive: {
    label: 'No portal access',
    tone: 'neutral',
    color: 'var(--color-surface-muted)',
    foregroundColor: 'var(--color-secondary)',
  },
}

export function DoctorPortalStatusBadge({ status }: { status: DoctorStatus }) {
  const details = statusDetails[status]

  return (
    <Badge
      color={details.color}
      foregroundColor={details.foregroundColor}
      tone={details.tone}
    >
      {details.label}
    </Badge>
  )
}
