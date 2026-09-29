import type { ReactNode } from 'react'

export type SegmentedControlOption<Value extends string> = {
  value: Value
  label: string
  ariaLabel: string
  icon?: ReactNode
}

type SegmentedControlProps<Value extends string> = {
  label: string
  value: Value
  options: SegmentedControlOption<Value>[]
  onValueChange: (value: Value) => void
  size?: 'default' | 'compact'
  variant?: 'surface' | 'dark'
}

export function SegmentedControl<Value extends string>({
  label,
  value,
  options,
  onValueChange,
  size = 'default',
  variant = 'surface',
}: SegmentedControlProps<Value>) {
  const isCompact = size === 'compact'
  const optionSize = isCompact ? 'min-h-6 gap-1 px-2 text-2xs' : 'min-h-8 gap-1.5 px-3 text-xs'

  return (
    <div
      role="group"
      aria-label={label}
      data-variant={variant}
      className="segmented-control inline-flex shrink-0 items-center gap-1 rounded-full border p-1 transition-colors"
    >
      {options.map((option) => {
        const isSelected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            className={`inline-flex items-center justify-center rounded-full font-bold transition-colors ${optionSize}`}
            onClick={() => onValueChange(option.value)}
            aria-label={option.ariaLabel}
            aria-pressed={isSelected}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}