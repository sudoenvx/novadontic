import { Mail, MapPin, Phone, Plus } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '../../../shared/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '../../../shared/ui/Card'
import type { Clinic } from '../domain/clinic'
import type { Doctor } from '../domain/doctor'
import { DoctorCard } from './DoctorCard'
import { PersonAvatar } from './PersonAvatar'

type ClinicDetailsProps = {
  clinic: Clinic
  doctors: Doctor[]
  onAddDoctor: () => void
  onDeleteDoctor: (doctorId: string) => void
  onEditDoctor: (doctor: Doctor) => void
  onRevokePortalAccess: (doctorId: string) => void
  onViewDoctor: (doctor: Doctor) => void
}

export function ClinicDetails({
  clinic,
  doctors,
  onAddDoctor,
  onDeleteDoctor,
  onEditDoctor,
  onRevokePortalAccess,
  onViewDoctor,
}: ClinicDetailsProps) {
  return (
    <Card size="sm" className="min-h-0">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <PersonAvatar name={clinic.name} />
            <div className="min-w-0">
              <CardTitle className="truncate normal-case">{clinic.name}</CardTitle>
              <CardDescription className="mt-0.5 flex items-center gap-1">
                <MapPin size={14} />
                {clinic.address}
              </CardDescription>
            </div>
          </div>
          <Button size="sm" onClick={onAddDoctor}>
            <Plus />
            Add doctor
          </Button>
        </div>

        <div className="grid gap-3 border-t border-border-soft pt-3 sm:grid-cols-3">
          <ContactDetail icon={<Phone size={16} />} label="Phone" value={clinic.phone} />
          <ContactDetail
            icon={<Mail size={16} />}
            label="Email"
            value={clinic.email}
          />
          <ContactDetail
            label="Active doctors"
            value={String(doctors.length)}
          />
        </div>
      </CardHeader>

      <div className="border-t border-border-soft pt-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-md font-semibold text-text">Doctors at {clinic.name}</h2>
            <p className="text-sm text-text-muted">Manage access and production activity.</p>
          </div>
        </div>
        {doctors.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onDelete={() => onDeleteDoctor(doctor.id)}
                onEdit={() => onEditDoctor(doctor)}
                onRevokePortalAccess={() => onRevokePortalAccess(doctor.id)}
                onClick={() => onViewDoctor(doctor)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md bg-surface-muted/70 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-text">No doctors assigned yet.</p>
            <p className="mt-1 text-xs text-text-muted">Invite the first doctor to this clinic.</p>
            <Button size="sm" className="mt-3" onClick={onAddDoctor}>
              <Plus />
              Add doctor
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

function ContactDetail({
  icon,
  label,
  value,
}: {
  icon?: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      {icon && <div className="mt-0.5 shrink-0 text-text-muted">{icon}</div>}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
        <p className="mt-1 truncate text-sm text-text">{value}</p>
      </div>
    </div>
  )
}
