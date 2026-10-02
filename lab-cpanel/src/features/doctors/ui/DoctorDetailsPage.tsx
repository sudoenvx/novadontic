import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useClinicOptions } from '../../clinics/queries/clinic.queries'
import { getApiErrorMessage } from '../../../shared/api/apiError'
import { Button } from '../../../shared/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '../../../shared/ui/Card'
import { PageLoading } from '../../../shared/ui/Loading'
import { Page } from '../../../shared/ui/Page'
import { toast } from '../../../shared/ui/Toast'
import {
  useDoctor,
  useUpdateDoctor,
} from '../queries/doctor.queries'
import { DoctorPortalStatusBadge } from './DoctorPortalStatusBadge'
import { DoctorFormDialog } from './DoctorFormDialog'
import type { DoctorInput } from '../domain/doctor'

export function DoctorDetailsPage() {
  const { doctorId = '' } = useParams<{ doctorId: string }>()
  const navigate = useNavigate()
  const doctorQuery = useDoctor(doctorId)
  const clinicsQuery = useClinicOptions()
  const updateDoctor = useUpdateDoctor()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const doctor = doctorQuery.data

  function handleUpdateDoctor(input: DoctorInput) {
    updateDoctor.mutate(
      { doctorId, input },
      {
        onSuccess: () => {
          setIsEditOpen(false)
          toast.add({ title: 'Doctor profile updated', type: 'success' })
        },
        onError: (error) =>
          toast.add({
            title: 'Unable to update doctor',
            description: getApiErrorMessage(error, 'Please try again.'),
            type: 'error',
          }),
      },
    )
  }

  if (doctorQuery.isPending) {
    return (
      <Page size="full">
        <PageLoading label="Loading doctor profile" />
      </Page>
    )
  }

  if (doctorQuery.isError || !doctor) {
    return (
      <Page size="full">
        <div role="alert" className="grid justify-items-center gap-3 rounded-md bg-surface px-4 py-10 text-center">
          <p className="text-sm font-semibold text-text">
            {doctorQuery.isError
              ? getApiErrorMessage(doctorQuery.error, 'Unable to load doctor.')
              : 'Doctor not found.'}
          </p>
          <Button onClick={() => navigate('/doctors')}>Back to doctors</Button>
        </div>
      </Page>
    )
  }

  return (
    <Page size="full">
      <div className="grid gap-3">
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => navigate('/doctors')}
        >
          Back to doctors
        </Button>
        <Card size="sm" className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-text">
                {doctor.fullName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <DoctorPortalStatusBadge isActive={doctor.isActive} />
                <span className="text-sm text-text-secondary">
                  {doctor.source === 'portal' ? 'Website / portal' : 'Clinic'}
                </span>
                {doctor.clinics.map((clinic) => (
                  <span
                    key={clinic.id}
                    className="rounded-sm bg-surface-muted px-2 py-0.5 text-xs text-text-secondary"
                  >
                    {clinic.name}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-text-muted">
                Created {doctor.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>Edit doctor profile</Button>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Doctor profile</CardTitle>
            <CardDescription>Contact and practice information.</CardDescription>
          </CardHeader>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileDetail label="Specialty" value={doctor.specialty} />
            <ProfileDetail label="Email" value={doctor.email} />
            <ProfileDetail label="Phone" value={doctor.phone} />
            <ProfileDetail label="Address" value={doctor.address} />
            <ProfileDetail label="Country" value={doctor.country} />
            <ProfileDetail label="Notes" value={doctor.notes} />
          </dl>
        </Card>
      </div>
      <DoctorFormDialog
        key={doctor.id}
        clinics={clinicsQuery.data ?? []}
        doctor={doctor}
        mode="edit"
        onOpenChange={setIsEditOpen}
        onSubmit={handleUpdateDoctor}
        open={isEditOpen}
        isPending={updateDoctor.isPending}
      />
    </Page>
  )
}

function ProfileDetail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-text">
        {value || 'Not provided'}
      </dd>
    </div>
  )
}
