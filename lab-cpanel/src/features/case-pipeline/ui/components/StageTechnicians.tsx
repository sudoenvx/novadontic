import { UserPlus, Users, X } from 'lucide-react'

import { Button } from '../../../../shared/ui/Button'
import { getApiErrorMessage } from '../../../../shared/api/apiError'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../shared/ui/DropdownMenu'
import { useStaff } from '../../../staff/queries/staff.queries'

type StageTechniciansProps = {
  technicians: string[]
  onAssign: (name: string) => void
  onRemove: (name: string) => void
  canAssign: boolean
}

export function StageTechnicians({
  technicians,
  onAssign,
  onRemove,
  canAssign,
}: StageTechniciansProps) {
  const staffQuery = useStaff(undefined, canAssign)
  const activeTechnicians = (staffQuery.data?.data ?? []).filter(
    (member) => member.isActive && member.roles.some((role) => role.code === 'technician'),
  )

  return (
    <section className="grid content-start gap-2.5 border-b border-border-soft pb-3" aria-label="Stage technicians">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Users size={13} className="text-primary" />
          <span className="text-xs font-semibold text-text-primary">
            Assigned technicians ({technicians.length})
          </span>
        </div>
        {canAssign && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="xs" variant="outline" className="gap-1.5">
                  <UserPlus size={12} />
                  <span>Assign technicians</span>
                  {technicians.length > 0 && (
                    <span className="grid min-w-4 place-items-center rounded-full bg-surface-muted px-1 text-2xs tabular text-text-secondary">
                      {technicians.length}
                    </span>
                  )}
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-72 p-1.5">
              <DropdownMenuLabel className="px-2.5 py-2">
                <span className="block text-sm font-semibold text-text-primary">
                  Assign technicians
                </span>
                <span className="mt-0.5 block text-xs font-normal text-text-muted">
                  Select everyone working on this stage.
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {staffQuery.isPending && (
                <p role="status" className="px-2.5 py-3 text-sm text-text-muted">
                  Loading technicians…
                </p>
              )}
              {staffQuery.isError && (
                <p role="alert" className="px-2.5 py-3 text-xs text-destructive">
                  {getApiErrorMessage(staffQuery.error, 'Unable to load technicians.')}
                </p>
              )}
              {activeTechnicians.map((staff) => {
                const isAssigned = technicians.includes(staff.fullName)
                return (
                  <DropdownMenuCheckboxItem
                    key={staff.id}
                    checked={isAssigned}
                    onCheckedChange={() => onAssign(staff.fullName)}
                    className="min-h-control-md rounded-md px-2.5 py-2"
                  >
                    <span className="avatar grid size-8 shrink-0 place-items-center rounded-full text-2xs font-semibold">
                      {getInitials(staff.fullName)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{staff.fullName}</span>
                  </DropdownMenuCheckboxItem>
                )
              })}
              {!staffQuery.isPending &&
                !staffQuery.isError &&
                activeTechnicians.length === 0 && (
                  <p className="px-2.5 py-3 text-xs text-text-muted">
                    No active technicians are available.
                  </p>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {technicians.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {technicians.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-2.5 py-1 text-xs font-medium text-text-primary shadow-sm"
            >
              <span className="size-1.5 rounded-full bg-success" />
              {name}
              {canAssign && (
                <button
                  type="button"
                  onClick={() => onRemove(name)}
                  className="ml-0.5 grid size-4 place-items-center rounded-full text-text-muted transition-colors hover:bg-destructive-soft hover:text-destructive focus-visible:outline-2 focus-visible:outline-focus"
                  aria-label={`Unassign ${name}`}
                >
                  <X size={11} />
                </button>
              )}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-muted">No technicians assigned yet.</p>
      )}
    </section>
  )
}

function getInitials(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((namePart) => namePart[0]?.toUpperCase() ?? '')
    .join('')
}
