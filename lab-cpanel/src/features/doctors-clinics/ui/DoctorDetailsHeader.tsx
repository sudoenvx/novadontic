import { ArrowLeft, MoreHorizontal } from 'lucide-react'

import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../shared/ui/DropdownMenu'
import type { Clinic } from '../domain/clinic'
import type { Doctor } from '../domain/doctor'
import type { DoctorDetails } from '../domain/doctorDetails'
import { PersonAvatar } from './PersonAvatar'
import { DoctorPortalStatusBadge } from './DoctorPortalStatusBadge'

type DoctorDetailsHeaderProps = {
  clinic?: Clinic
  details: DoctorDetails
  doctor: Doctor
  onBack: () => void
  onEdit: () => void
}

export function DoctorDetailsHeader({ clinic, details, doctor, onBack, onEdit }: DoctorDetailsHeaderProps) {
  return (
    <div className="grid gap-2">
      <Button variant="ghost" className="w-fit" onClick={onBack}>
        <ArrowLeft />
        Back to doctors
      </Button>
      <Card size="sm" className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <PersonAvatar name={doctor.name} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-text">{doctor.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge tone="info">{doctor.specialty}</Badge>
              <DoctorPortalStatusBadge status={doctor.status} />
              {clinic && <Badge tone="neutral">{clinic.name}</Badge>}
            </div>
            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-4 sm:gap-4">
              <Detail label="Email" value={doctor.email} />
              <Detail label="Phone" value={doctor.phoneNumber} />
              <Detail label="Member since" value={details.memberSince} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button onClick={onEdit}>Edit doctor profile</Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="More doctor actions" />}
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Copy doctor email</DropdownMenuItem>
              <DropdownMenuItem>Export profile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-0.5 truncate text-sm text-text">{value}</p>
    </div>
  )
}
