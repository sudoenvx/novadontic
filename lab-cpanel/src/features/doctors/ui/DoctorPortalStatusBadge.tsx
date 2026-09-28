import { Badge } from '../../../shared/ui/Badge'
import type { DoctorStatus } from '../domain/doctor'

export function DoctorPortalStatusBadge({ status }: { status: DoctorStatus }) {
  const config = {
    active: { label: 'Portal active', tone: 'success' as const },
    pending: { label: 'Invite pending', tone: 'warning' as const },
    inactive: { label: 'No portal access', tone: 'neutral' as const },
  }[status]

  return <Badge tone={config.tone}>{config.label}</Badge>
}
