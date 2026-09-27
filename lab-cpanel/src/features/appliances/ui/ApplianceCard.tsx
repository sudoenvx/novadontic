import { ArrowUpRight, Layers3 } from 'lucide-react'

import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { getApplianceFieldCount, getApplianceGroupCount, type Appliance } from '../domain/appliance'

type ApplianceCardProps = {
  appliance: Appliance
  onOpen: () => void
  onToggle: () => void
}

export function ApplianceCard({ appliance, onOpen, onToggle }: ApplianceCardProps) {
  const fieldCount = getApplianceFieldCount(appliance)
  const groupCount = getApplianceGroupCount(appliance)

  return (
    <Card className="gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-md text-xl" style={{ backgroundColor: appliance.color }} aria-hidden="true">
            {appliance.icon}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-text">{appliance.name}</h2>
            <p className="text-xs text-text-muted">{appliance.source}</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={appliance.isActive}
          aria-label={`${appliance.isActive ? 'Deactivate' : 'Activate'} ${appliance.name}`}
          onClick={(event) => {
            event.stopPropagation()
            onToggle()
          }}
          className={`relative mt-1 h-6 w-10 shrink-0 rounded-full p-0.5 transition-colors ${appliance.isActive ? 'bg-primary' : 'bg-surface-muted'}`}
        >
          <span className={`block size-5 rounded-full bg-surface shadow-sm transition-transform ${appliance.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      </div>
      <div className="border-t border-border pt-3">
        <div className="flex gap-6">
          <div>
            <p className="text-lg font-semibold leading-none text-text">{groupCount}</p>
            <p className="mt-1 text-[10px] uppercase text-text-muted">Groups</p>
          </div>
          <div>
            <p className="text-lg font-semibold leading-none text-text">{fieldCount}</p>
            <p className="mt-1 text-[10px] uppercase text-text-muted">Fields</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        {appliance.casesUsing > 0 ? (
          <Badge tone="success"><Layers3 /> {appliance.casesUsing} cases using it</Badge>
        ) : (
          <Badge>Not used yet</Badge>
        )}
        <Button variant="ghost" size="sm" onClick={onOpen}>
          Manage <ArrowUpRight />
        </Button>
      </div>
    </Card>
  )
}
