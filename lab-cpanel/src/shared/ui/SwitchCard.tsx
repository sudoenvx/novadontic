import { Switch } from './Switch'

type SwitchCardProps = {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

export function SwitchCard({ checked, description, disabled, onCheckedChange, title }: SwitchCardProps) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-sm bg-surface-muted/60 px-2 py-2">
      <span className="grid gap-0.5">
        <span className="text-sm font-medium text-text">{title}</span>
        <span className="text-xs text-text-muted">{description}</span>
      </span>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} aria-label={title} />
    </label>
  )
}
