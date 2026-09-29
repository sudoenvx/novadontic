import { Building2 } from 'lucide-react'
import { cn } from 'cn'

import {
  Card,
  CardHeader,
  CardTitle,
} from '../../../shared/ui/Card'
import type { Clinic } from '../domain/clinic'
import type { Doctor } from '../domain/doctor'
import { getDoctorsForClinic } from '../domain/doctor'
import { PersonAvatar } from './PersonAvatar'

type ClinicListProps = {
  clinics: Clinic[]
  doctors: Doctor[]
  selectedClinicId: string
  onSelectClinic: (clinicId: string) => void
}

export function ClinicList({
  clinics,
  doctors,
  onSelectClinic,
  selectedClinicId,
}: ClinicListProps) {
  return (
    <Card size="sm" className="min-h-0 xl:sticky xl:top-[calc(var(--navbar-height)+var(--page-gap))] xl:self-start">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 normal-case">
          <Building2 size={15} />
          Clinics <span className="text-text-muted text-xs font-mono">({clinics.length})</span>
        </CardTitle>
      </CardHeader>
      <div className="grid gap-1">
        {clinics.length > 0 ? (
          clinics.map((clinic) => {
            const doctorCount = getDoctorsForClinic(clinic.id, doctors).length

            return (
              <button
                key={clinic.id}
                type="button"
                className={cn(
                  'flex items-center gap-2 rounded-sm p-1.5 text-left transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  selectedClinicId === clinic.id &&
                    'bg-neutral-100',
                )}
                onClick={() => onSelectClinic(clinic.id)}
                aria-pressed={selectedClinicId === clinic.id}
              >
                <PersonAvatar
                  name={clinic.name}
                  size="sm"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text">
                    {clinic.name}
                  </span>
                  <span className="block truncate text-xs text-text-muted">
                    {clinic.address}
                  </span>
                </span>
                <span className="rounded-sm bg-surface-muted px-1.5 py-0.5 text-xs font-semibold text-secondary">
                  {doctorCount}
                </span>
              </button>
            )
          })
        ) : (
          <p className="px-2 py-6 text-center text-sm text-text-muted">
            No clinics match your search.
          </p>
        )}
      </div>
    </Card>
  )
}
