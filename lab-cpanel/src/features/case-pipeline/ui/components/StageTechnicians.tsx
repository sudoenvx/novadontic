import { UserCheck, UserPlus, Users, X } from 'lucide-react'

import { Button } from '../../../../shared/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../shared/ui/DropdownMenu'
import { staffFixtures } from '../../../staff/data/staff'

type StageTechniciansProps = {
  technicians: string[]
  onAssign: (name: string) => void
  onRemove: (name: string) => void
}

export function StageTechnicians({ technicians, onAssign, onRemove }: StageTechniciansProps) {
  return (
    <section className="grid content-start gap-2 border-b border-border-soft pb-3" aria-label="Stage technicians">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Users size={13} className="text-primary" />
          <span className="text-xs font-semibold text-text-primary">
            Assigned technicians ({technicians.length})
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="xs" variant="outline" className="gap-1">
                <UserPlus size={12} />
                <span>Assign technicians</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            {staffFixtures
              .filter((staff) => staff.status === 'active')
              .map((staff) => {
                const isAssigned = technicians.includes(staff.name)
                return (
                  <DropdownMenuItem
                    key={staff.id}
                    onClick={() => onAssign(staff.name)}
                    className="flex items-center justify-between py-1.5 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="avatar size-6 text-2xs">
                        {staff.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span>{staff.name}</span>
                    </div>
                    {isAssigned && <UserCheck size={13} className="shrink-0 text-success" />}
                  </DropdownMenuItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {technicians.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {technicians.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-0.5 text-xs font-medium text-text-primary"
            >
              <span className="size-1.5 rounded-full bg-success" />
              {name}
              <button
                type="button"
                onClick={() => onRemove(name)}
                className="ml-0.5 text-text-muted transition-colors hover:text-destructive"
                aria-label={`Unassign ${name}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-muted">No technicians assigned yet.</p>
      )}
    </section>
  )
}
