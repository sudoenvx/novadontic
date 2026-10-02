import { Badge } from '../../../shared/ui/Badge'

export function DoctorPortalStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge tone={isActive ? 'success' : 'neutral'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  )
}
