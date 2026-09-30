import { useEffect, useId, useRef, useState } from 'react'
import { Pipette } from 'lucide-react'

import { Button } from './Button'
import { Input } from './Input'
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip'

const DEFAULT_PRESETS = [
  '#2c64ef',
  '#8b3ff2',
  '#0b7a68',
  '#c77700',
  '#d64550',
  '#12172a',
]

export type ColorPickerProps = {
  value?: string
  defaultValue?: string
  onChange?: (hex: string) => void
  presets?: string[]
  label?: string
  disabled?: boolean
  inline?: boolean
  className?: string
}

function normalizeHex(value: string) {
  const normalized = value.trim().startsWith('#')
    ? value.trim()
    : `#${value.trim()}`

  return /^#[\da-f]{6}$/i.test(normalized) ? normalized.toLowerCase() : undefined
}

export default function ColorPicker({
  value,
  defaultValue = '#2c64ef',
  onChange,
  presets = DEFAULT_PRESETS,
  label = 'Color',
  disabled = false,
  inline = false,
  className = '',
}: ColorPickerProps) {
  const initialColor = normalizeHex(value ?? defaultValue) ?? '#2c64ef'
  const [internalColor, setInternalColor] = useState(initialColor)
  const [hexInput, setHexInput] = useState({
    color: initialColor,
    draft: initialColor.slice(1),
  })
  const [isOpen, setIsOpen] = useState(inline)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputId = useId()
  const color = normalizeHex(value ?? internalColor) ?? internalColor
  const hexDraft = hexInput.color === color ? hexInput.draft : color.slice(1)

  useEffect(() => {
    if (!isOpen || inline) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [inline, isOpen])

  function commitColor(rawColor: string) {
    const normalizedColor = normalizeHex(rawColor)
    if (!normalizedColor) return

    setInternalColor(normalizedColor)
    setHexInput({ color: normalizedColor, draft: normalizedColor.slice(1) })
    onChange?.(normalizedColor)
  }

  function commitHexDraft() {
    const normalizedColor = normalizeHex(hexInput.draft)
    if (normalizedColor) {
      commitColor(normalizedColor)
    } else {
      setHexInput({ color, draft: color.slice(1) })
    }
  }

  const panel = (
    <div className="grid w-64 gap-3 rounded-lg border border-border bg-surface p-3 shadow-popover">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`${inputId}-native`} className="text-sm font-semibold text-text-primary">
          {label}
        </label>
        <span
          className="size-6 rounded-sm border border-border"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      </div>

      <input
        id={`${inputId}-native`}
        type="color"
        value={color}
        disabled={disabled}
        aria-label={`${label} picker`}
        onChange={(event) => commitColor(event.currentTarget.value)}
        className="h-10 w-full cursor-pointer rounded-sm border border-border bg-surface p-1 disabled:cursor-not-allowed disabled:opacity-50"
      />

      <div className="grid gap-1.5">
        <label htmlFor={inputId} className="text-xs font-medium text-text-secondary">
          Hex value
        </label>
        <Input
          id={inputId}
          value={hexDraft}
          variant="outline"
          size="sm"
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          aria-label={`${label} hex value`}
          onChange={(event) => setHexInput({
            color,
            draft: event.currentTarget.value.replace(/^#/, ''),
          })}
          onBlur={commitHexDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commitHexDraft()
            }
          }}
          className="font-mono uppercase"
        />
      </div>

      {presets.length > 0 && (
        <div className="grid gap-1.5">
          <p className="text-xs font-medium text-text-secondary">Suggested colors</p>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => {
              const normalizedPreset = normalizeHex(preset)
              if (!normalizedPreset) return null

              return (
                <button
                  key={normalizedPreset}
                  type="button"
                  className="size-control-sm rounded-sm border border-border transition hover:ring-2 hover:ring-focus/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  style={{ backgroundColor: normalizedPreset }}
                  aria-label={`Use color ${normalizedPreset}`}
                  aria-pressed={color === normalizedPreset}
                  onClick={() => commitColor(normalizedPreset)}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  if (inline) {
    return (
      <div ref={rootRef} className={className}>
        {panel}
      </div>
    )
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              size="icon-sm"
              variant="neutral"
              disabled={disabled}
              aria-label={label}
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((current) => !current)}
            />
          }
        >
          <span className="relative grid size-5 place-items-center">
            <span
              className="size-4 rounded-full border border-border"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <Pipette className="absolute size-3 text-text-primary drop-shadow" aria-hidden="true" />
          </span>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      {isOpen && (
        <div
          className="absolute end-0 top-full z-dropdown mt-2"
          role="dialog"
          aria-label={`${label} options`}
        >
          {panel}
        </div>
      )}
    </div>
  )
}
