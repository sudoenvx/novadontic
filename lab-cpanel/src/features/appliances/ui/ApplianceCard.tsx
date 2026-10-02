import { SlidersHorizontal } from 'lucide-react'

import { Badge } from '../../../shared/ui/Badge'
import { Card } from '../../../shared/ui/Card'
import { Switch } from '../../../shared/ui/Switch'
import { getApplianceFieldCount, getApplianceGroupCount, type Appliance } from '../domain/appliance'
import type { KeyboardEvent } from 'react'

type ApplianceCardProps = {
  appliance: Appliance
  onOpen: () => void
  onToggle: () => void
  isPending?: boolean
}

export function ApplianceCard({
  appliance,
  onOpen,
  onToggle,
  isPending = false,
}: ApplianceCardProps) {
  const fieldCount = getApplianceFieldCount(appliance)
  const groupCount = getApplianceGroupCount(appliance)
  const isConfigured = fieldCount > 0
  const isGlobal = appliance.source?.toLowerCase().includes('platform') ?? false

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen()
    }
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      aria-label={`Open ${appliance.name}`}
      className={`group gap-4 cursor-pointer transition-all  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
    >
      {/* Header: icon, name, scope pill, and the toggle — the switch is the one
          control that must NOT trigger onOpen, so its click is stopped below. */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid size-8 shrink-0 place-items-center rounded-sm transition-colors ${
              appliance.isActive
                ? 'bg-primary-soft text-primary-soft-foreground'
                : 'bg-surface-muted text-text-muted'
            }`}
            aria-hidden="true"
          >
            <SlidersHorizontal size={19} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-text" title={appliance.name}>
              {appliance.name}
            </h2>
            <p className="mt-0.5 truncate text-xs text-text-muted">
              {isGlobal ? 'Platform default' : appliance.source}
            </p>
          </div>
        </div>
        <Switch
          checked={appliance.isActive}
          disabled={isPending}
          aria-label={`${appliance.isActive ? 'Deactivate' : 'Activate'} ${appliance.name}`}
          onCheckedChange={() => {
            onToggle()
          }}
          onClick={(event) => event.stopPropagation()}
        />
      </div>

      {!isConfigured && (
        <p className="-mt-1 text-xs font-medium text-amber-600">
          No fields configured yet — cases of this type won't collect any specifics.
        </p>
      )}

      {/* Footer: status + usage on the left (what it IS), action on the right
          (what you can DO). Configure still works as its own button for anyone
          who only wants to click the exact label, but the whole card is live. */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Badge tone={appliance.isActive ? 'success' : 'destructive'}>
            {appliance.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Badge tone={appliance.casesUsing && appliance.casesUsing > 0 ? 'info' : 'neutral'}>
            {appliance.casesUsing === null
              ? 'Usage not tracked'
              : appliance.casesUsing > 0
                ? `${appliance.casesUsing} cases used it`
                : 'Not used yet'}
          </Badge>
          <Badge tone="info">{groupCount} groups</Badge>
          <Badge tone="info">{fieldCount} fields</Badge>
        </div>
      </div>
    </Card>
  )
}