import { useId } from 'react'

import { Field, FieldContent, FieldDescription, FieldLabel } from './Field'
import { Switch } from './Switch'

type SwitchCardProps = {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

export function SwitchCard({ checked, description, disabled, onCheckedChange, title }: SwitchCardProps) {
  const titleId = useId()
  const descriptionId = useId()
  const switchId = useId()

  return (
    <Field
      orientation="horizontal"
      data-disabled={disabled || undefined}
      className="items-start gap-3"
    >
      <FieldContent className="min-w-0 gap-0.5">
        <FieldLabel htmlFor={switchId} id={titleId} className="cursor-pointer text-sm font-semibold text-text-primary">
          {title}
        </FieldLabel>
        <FieldDescription id={descriptionId} className="text-xs text-text-secondary">
          {description}
        </FieldDescription>
      </FieldContent>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        id={switchId}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      />
    </Field>
  )
}
