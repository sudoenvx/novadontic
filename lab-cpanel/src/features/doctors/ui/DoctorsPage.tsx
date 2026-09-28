import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../../shared/ui/Button'
import { AppHeader, AppHeaderActions } from '../../../shared/ui/AppHeader'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../../../shared/ui/InputGroup'
import { Page } from '../../../shared/ui/Page'
import { toast } from '../../../shared/ui/Toast'
import { clinicFixtures } from '../../clinics/data/clinics'
import { doctorFixtures } from '../data/doctors'
import { filterDoctors } from '../domain/doctor'
import type { Doctor } from '../domain/doctor'
import { CreateDoctorDialog, type NewDoctor } from './CreateDoctorDialog'
import { DoctorFormDialog, type DoctorFormValues } from './DoctorFormDialog'
import { DoctorTable } from './DoctorTable'

export function DoctorsPage() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState<Doctor[]>(doctorFixtures)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const visibleDoctors = filterDoctors(doctors, clinicFixtures, searchTerm)

  function handleCreateDoctor(values: NewDoctor) {
    const doctor: Doctor = {
      ...values,
      id: `doctor-${doctors.length + 1}`,
      activeCases: 0,
      status: 'pending',
    }

    setDoctors((currentDoctors) => [...currentDoctors, doctor])
    setIsCreateOpen(false)
    toast.add({ title: 'Doctor invited', description: `${doctor.name} was added to your doctors list.`, type: 'success' })
  }

  function handleUpdateDoctor(values: DoctorFormValues) {
    if (!editingDoctor) return

    setDoctors((currentDoctors) =>
      currentDoctors.map((doctor) =>
        doctor.id === editingDoctor.id
          ? {
              ...doctor,
              ...values,
              status: values.isActive
                ? doctor.status === 'inactive' ? 'pending' : doctor.status
                : 'inactive',
            }
          : doctor,
      ),
    )
    setEditingDoctor(null)
    toast.add({ title: 'Doctor profile updated', type: 'success' })
  }

  function handleDeleteDoctor(doctorId: string) {
    setDoctors((currentDoctors) => currentDoctors.filter((doctor) => doctor.id !== doctorId))
    toast.add({ title: 'Doctor deleted', type: 'success' })
  }

  function handleRevokePortalAccess(doctorId: string) {
    setDoctors((currentDoctors) =>
      currentDoctors.map((doctor) =>
        doctor.id === doctorId ? { ...doctor, isActive: false, status: 'inactive' } : doctor,
      ),
    )
    toast.add({ title: 'Portal access revoked', type: 'success' })
  }

  function openDoctorDetails(doctor: Doctor) {
    navigate(`/doctors/${doctor.id}`, {
      state: { doctor, clinic: clinicFixtures.find((clinic) => clinic.id === doctor.clinicId) },
    })
  }

  return (
    <Page size="full">
      <AppHeader title="Doctors" description="Manage doctor profiles, clinic links, and portal access.">
        <AppHeaderActions>
          <InputGroup className="w-64" variant="outline">
            <InputGroupAddon><Search /></InputGroupAddon>
            <InputGroupInput value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} placeholder="Search doctors" aria-label="Search doctors" />
          </InputGroup>
          <Button onClick={() => setIsCreateOpen(true)}><Plus /> Add doctor</Button>
        </AppHeaderActions>
      </AppHeader>

      <DoctorTable
        description="Doctors can be linked to a clinic or added through the website portal."
        doctors={visibleDoctors}
        getClinicName={(doctor) => clinicFixtures.find((clinic) => clinic.id === doctor.clinicId)?.name}
        onDelete={(doctor) => handleDeleteDoctor(doctor.id)}
        onEdit={setEditingDoctor}
        onRevokePortalAccess={(doctor) => handleRevokePortalAccess(doctor.id)}
        onView={openDoctorDetails}
        title={`All doctors (${visibleDoctors.length})`}
      />

      <CreateDoctorDialog
        clinics={clinicFixtures}
        initialClinicId=""
        onCreate={handleCreateDoctor}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
      <DoctorFormDialog
        key={editingDoctor?.id ?? 'doctor-edit-form'}
        clinics={clinicFixtures}
        doctor={editingDoctor ?? undefined}
        mode="edit"
        onOpenChange={(open) => { if (!open) setEditingDoctor(null) }}
        onSubmit={handleUpdateDoctor}
        open={editingDoctor !== null}
      />
    </Page>
  )
}
