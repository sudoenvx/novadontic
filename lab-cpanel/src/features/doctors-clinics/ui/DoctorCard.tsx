import { Mail, MoreHorizontal, Pencil, ShieldOff, Trash2 } from 'lucide-react'
import type { KeyboardEvent, MouseEvent } from 'react'

import { Button } from '../../../shared/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../shared/ui/DropdownMenu'
import type { Doctor } from '../domain/doctor'
import { PersonAvatar } from './PersonAvatar'
import { DoctorPortalStatusBadge } from './DoctorPortalStatusBadge'

type DoctorCardProps = {
  doctor: Doctor
  clinicName?: string
  showClinic?: boolean
  onDelete?: () => void
  onEdit?: () => void
  onRevokePortalAccess?: () => void
  onClick?: () => void
}

export function DoctorCard({
  clinicName,
  doctor,
  onDelete,
  onEdit,
  onRevokePortalAccess,
  onClick,
  showClinic = false,
}: DoctorCardProps) {
  function handleCardClick(event: MouseEvent<HTMLElement>) {
    if (onClick && !(event.target as HTMLElement).closest('button, a')) {
      onClick()
    }
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (
      onClick &&
      !(event.target as HTMLElement).closest('button, a') &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <article
      className={`flex min-w-0 flex-col gap-3 rounded-md border border-border-subtle p-2 ${onClick ? 'cursor-pointer transition-colors hover:border-primary' : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `View details for ${doctor.name}` : undefined}
    >
      <div className="flex items-start gap-2.5">
        <PersonAvatar
          name={doctor.name}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-text">
            {doctor.name}
          </h3>
          <p className="truncate text-xs text-text-muted">{doctor.specialty}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${doctor.name}`}
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil />
              Edit doctor
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={doctor.status === 'inactive'}
              onClick={onRevokePortalAccess}
            >
              <ShieldOff />
              Revoke portal access
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 />
              Delete doctor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {showClinic && clinicName && (
          <span className="text-xs font-semibold text-primary">
            {clinicName}
          </span>
        )}
        <DoctorPortalStatusBadge status={doctor.status} />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-2 text-xs text-secondary">
        <span>
          <strong className="text-text">{doctor.activeCases}</strong>{' '}
          active {doctor.activeCases === 1 ? 'case' : 'cases'}
        </span>
        <a
          href={`mailto:${doctor.email}`}
          className="inline-flex min-w-0 items-center gap-1 truncate text-primary hover:underline"
        >
          <Mail size={12} />
          <span className="truncate">{doctor.email}</span>
        </a>
      </div>
    </article>
  )
}
