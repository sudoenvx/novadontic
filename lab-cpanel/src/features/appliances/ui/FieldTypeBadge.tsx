import { Badge } from '../../../shared/ui/Badge'
import type { ApplianceFieldType } from '../domain/appliance'

const fieldTypeColors: Record<ApplianceFieldType, { background: string; foreground: string }> = {
  text: { background: '#e4f1f5', foreground: '#17617a' },
  number: { background: '#e6eefb', foreground: '#1e5ca8' },
  select: { background: '#e7eafb', foreground: '#4f46a5' },
  multiselect: { background: '#f4e6f1', foreground: '#a33d78' },
  textarea: { background: '#edf0f5', foreground: '#53627a' },
  date: { background: '#f5eddf', foreground: '#9a5d08' },
  checkbox: { background: '#e2f2ec', foreground: '#16735f' },
  file: { background: '#e8edf4', foreground: '#425572' },
  image: { background: '#eee7f8', foreground: '#7044a5' },
}

type FieldTypeBadgeProps = {
  type: ApplianceFieldType
}

export function FieldTypeBadge({ type }: FieldTypeBadgeProps) {
  const colors = fieldTypeColors[type]

  return <Badge color={colors.background} foregroundColor={colors.foreground}>{type}</Badge>
}
