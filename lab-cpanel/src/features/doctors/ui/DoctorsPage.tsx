import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useClinicOptions } from '../../clinics/queries/clinic.queries'
import { Button } from '../../../shared/ui/Button'
import { getApiErrorMessage } from '../../../shared/api/apiError'
import { PageHeader, PageHeaderActions } from '../../../shared/ui/PageHeader'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../../../shared/ui/InputGroup'
import { Page } from '../../../shared/ui/Page'
import { toast } from '../../../shared/ui/Toast'
import type { Doctor, DoctorInput } from '../domain/doctor'
import {
  useCreateDoctor,
  useDeleteDoctor,
  useDoctors,
  useUpdateDoctor,
} from '../queries/doctor.queries'
import { CreateDoctorDialog } from './CreateDoctorDialog'
import { DoctorFormDialog } from './DoctorFormDialog'
import { DoctorTable } from './DoctorTable'

export function DoctorsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const doctorsQuery = useDoctors(searchTerm)
  const clinicsQuery = useClinicOptions()
  const createDoctor = useCreateDoctor()
  const updateDoctor = useUpdateDoctor()
  const deleteDoctor = useDeleteDoctor()
  const doctors = doctorsQuery.data?.data ?? []

  function handleCreateDoctor(input: DoctorInput) {
    createDoctor.mutate(input, {
      onSuccess: (doctor) => {
        setIsCreateOpen(false)
        toast.add({
          title: 'Doctor added',
          description: `${doctor.fullName} was added to your doctors list.`,
          type: 'success',
        })
      },
      onError: (error) => showMutationError(error),
    })
  }

  function handleUpdateDoctor(input: DoctorInput) {
    if (!editingDoctor) return
    updateDoctor.mutate(
      { doctorId: editingDoctor.id, input },
      {
        onSuccess: (doctor) => {
          setEditingDoctor(null)
          toast.add({
            title: 'Doctor profile updated',
            description: `${doctor.fullName} was updated.`,
            type: 'success',
          })
        },
        onError: (error) => showMutationError(error),
      },
    )
  }

  function handleDeleteDoctor(doctor: Doctor) {
    deleteDoctor.mutate(doctor.id, {
      onSuccess: () =>
        toast.add({
          title: 'Doctor deleted',
          description: `${doctor.fullName} was removed.`,
          type: 'success',
        }),
      onError: (error) => showMutationError(error),
    })
  }

  function handleRevokePortalAccess(doctor: Doctor) {
    updateDoctor.mutate(
      {
        doctorId: doctor.id,
        input: {
          fullName: doctor.fullName,
          isActive: false,
        },
      },
      {
        onSuccess: () =>
          toast.add({
            title: 'Doctor deactivated',
            description: `${doctor.fullName} is now inactive.`,
            type: 'success',
          }),
        onError: (error) => showMutationError(error),
      },
    )
  }

  function showMutationError(error: unknown) {
    toast.add({
      title: 'Unable to save doctor',
      description: getApiErrorMessage(error, 'Please try again.'),
      type: 'error',
    })
  }

  function openDoctorDetails(doctor: Doctor) {
    navigate(`/doctors/${doctor.id}`)
  }

  return (
    <Page size="full">
      <PageHeader
        title="Doctors"
        description="Manage doctor profiles, clinic links, and active status."
      >
        <PageHeaderActions>
          <InputGroup className="w-64" variant="outline">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
              placeholder="Search doctors"
              aria-label="Search doctors"
            />
          </InputGroup>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus /> Add doctor
          </Button>
        </PageHeaderActions>
      </PageHeader>

      {doctorsQuery.isError && (
        <p role="alert">
          {getApiErrorMessage(doctorsQuery.error, 'Unable to load doctors.')}
        </p>
      )}
      {clinicsQuery.isError && (
        <p role="alert">
          {getApiErrorMessage(clinicsQuery.error, 'Unable to load clinics.')}
        </p>
      )}
      {(doctorsQuery.data || doctorsQuery.isPending) && (
        <DoctorTable
          description="Doctors can be linked to a clinic or added through the website portal."
          doctors={doctors}
          getClinicName={(doctor) => doctor.clinics[0]?.name}
          loading={doctorsQuery.isPending}
          onDelete={handleDeleteDoctor}
          onEdit={setEditingDoctor}
          onRevokePortalAccess={handleRevokePortalAccess}
          onView={openDoctorDetails}
          title={doctorsQuery.data ? `All doctors (${doctorsQuery.data.total})` : 'All doctors'}
        />
      )}

      <CreateDoctorDialog
        clinics={clinicsQuery.data ?? []}
        onCreate={handleCreateDoctor}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
        isPending={createDoctor.isPending}
      />
      <DoctorFormDialog
        key={editingDoctor?.id ?? 'doctor-edit-form'}
        clinics={clinicsQuery.data ?? []}
        doctor={editingDoctor ?? undefined}
        mode="edit"
        onOpenChange={(open) => {
          if (!open) setEditingDoctor(null)
        }}
        onSubmit={handleUpdateDoctor}
        open={editingDoctor !== null}
        isPending={updateDoctor.isPending}
      />
    </Page>
  )
}
