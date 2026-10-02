import { Badge, type BadgeTone } from '../../../shared/ui/Badge'

export function DoctorPortalStatusBadge({ isActive }: { isActive: boolean }) {
  const details: { label: string; tone: BadgeTone } = isActive
    ? { label: 'Active', tone: 'success' }
    : { label: 'Inactive', tone: 'neutral' }

  return <Badge tone={details.tone}>{details.label}</Badge>
}
