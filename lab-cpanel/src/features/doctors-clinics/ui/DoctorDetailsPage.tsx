import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { Button } from '../../../shared/ui/Button'
import { Page } from '../../../shared/ui/Page'
import { clinicFixtures } from '../data/clinics'
import { doctorDetailsFixtures } from '../data/doctorDetails'
import { doctorFixtures } from '../data/doctors'
import type { Clinic } from '../domain/clinic'
import type { Doctor } from '../domain/doctor'
import { createDoctorDetails, type DoctorDetails } from '../domain/doctorDetails'
import { DoctorCaseHistory } from './DoctorCaseHistory'
import { DoctorDetailsHeader } from './DoctorDetailsHeader'
import { DoctorDetailsMetrics } from './DoctorDetailsMetrics'
import { DoctorFormDialog, type DoctorFormValues } from './DoctorFormDialog'
import { DoctorPracticeDetails } from './DoctorPracticeDetails'

type DoctorDetailsRouteState = {
  doctor?: Doctor
  clinic?: Clinic
}

export function DoctorDetailsPage() {
  const { doctorId } = useParams<{ doctorId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const routeState = location.state as DoctorDetailsRouteState | null
  const doctor = doctorFixtures.find((item) => item.id === doctorId) ?? routeState?.doctor

  if (!doctor) {
    return (
      <Page size="full">
        <div className="rounded-md bg-surface px-4 py-10 text-center">
          <p className="text-sm font-semibold text-text">Doctor not found</p>
          <Button className="mt-3" onClick={() => navigate('/doctors')}>
            Back to doctors
          </Button>
        </div>
      </Page>
    )
  }

  const clinic =
    clinicFixtures.find((item) => item.id === doctor.clinicId) ?? routeState?.clinic
  const details =
    doctorDetailsFixtures.find((item) => item.doctorId === doctor.id) ??
    createDoctorDetails(doctor)

  return <DoctorDetailsView clinic={clinic} details={details} doctor={doctor} onBack={() => navigate('/doctors')} />
}

function DoctorDetailsView({
  clinic,
  details,
  doctor: initialDoctor,
  onBack,
}: {
  clinic?: Clinic
  details: DoctorDetails
  doctor: Doctor
  onBack: () => void
}) {
  const [doctor, setDoctor] = useState(initialDoctor)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

  function handleEditDoctor(values: DoctorFormValues) {
    setDoctor((currentDoctor) => ({
      ...currentDoctor,
      ...values,
      status: values.isActive
        ? currentDoctor.status === 'inactive'
          ? 'pending'
          : currentDoctor.status
        : 'inactive',
    }))
    setIsEditProfileOpen(false)
  }

  return (
    <Page size="full">
      <DoctorDetailsHeader
        clinic={clinic}
        details={details}
        doctor={doctor}
        onBack={onBack}
        onEdit={() => setIsEditProfileOpen(true)}
      />
      <DoctorDetailsMetrics doctor={doctor} details={details} />
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <DoctorCaseHistory cases={details.caseHistory} />
        <DoctorPracticeDetails clinic={clinic} doctor={doctor} />
      </div>
      <DoctorFormDialog
        clinics={clinicFixtures}
        doctor={doctor}
        mode="edit"
        onOpenChange={setIsEditProfileOpen}
        onSubmit={handleEditDoctor}
        open={isEditProfileOpen}
      />
    </Page>
  )
}
