import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { LayoutGrid, List, Plus, Search } from 'lucide-react'

import { Card, CardHeader, CardTitle } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../../../shared/ui/InputGroup'
import { Page } from '../../../shared/ui/Page'
import { Tabs, TabsList, TabsTrigger } from '../../../shared/ui/Tabs'
import { toast } from '../../../shared/ui/Toast'
import { clinicFixtures } from '../data/clinics'
import { doctorFixtures } from '../data/doctors'
import { filterClinics } from '../domain/clinic'
import type { Clinic } from '../domain/clinic'
import { filterDoctors, getDoctorsForClinic } from '../domain/doctor'
import type { Doctor } from '../domain/doctor'
import { ClinicDetails } from './ClinicDetails'
import { ClinicList } from './ClinicList'
import { CreateClinicDialog, type NewClinic } from './CreateClinicDialog'
import { CreateDoctorDialog, type NewDoctor } from './CreateDoctorDialog'
import { DoctorFormDialog, type DoctorFormValues } from './DoctorFormDialog'
import { DoctorCard } from './DoctorCard'
import { DoctorTable } from './DoctorTable'

type ViewMode = 'clinics' | 'doctors'
type DoctorDisplayMode = 'grid' | 'table'

export function DoctorsClinicsPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>('clinics')
  const [searchTerm, setSearchTerm] = useState('')
  const [clinics, setClinics] = useState<Clinic[]>(clinicFixtures)
  const [doctors, setDoctors] = useState<Doctor[]>(doctorFixtures)
  const [selectedClinicId, setSelectedClinicId] = useState(clinicFixtures[0]?.id ?? '')
  const [isCreateClinicOpen, setIsCreateClinicOpen] = useState(false)
  const [isCreateDoctorOpen, setIsCreateDoctorOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [doctorDisplayMode, setDoctorDisplayMode] = useState<DoctorDisplayMode>('grid')

  const visibleClinics = filterClinics(clinics, searchTerm)
  const visibleDoctors = filterDoctors(doctors, searchTerm)
  const activeClinicId = visibleClinics.some((clinic) => clinic.id === selectedClinicId)
    ? selectedClinicId
    : visibleClinics[0]?.id ?? ''
  const activeClinic = clinics.find((clinic) => clinic.id === activeClinicId)
  const activeClinicDoctors = activeClinic
    ? getDoctorsForClinic(activeClinic.id, doctors)
    : []

  function handleCreateClinic(newClinic: NewClinic) {
    const clinic: Clinic = {
      id: `clinic-${clinics.length + 1}`,
      name: newClinic.name,
      legalName: null,
      address: newClinic.address,
      city: null,
      phone: newClinic.phone,
      email: newClinic.email,
      website: null,
      notes: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      doctors: [],
    }

    setClinics((currentClinics) => [...currentClinics, clinic])
    setSelectedClinicId(clinic.id)
    setViewMode('clinics')
    toast.add({
      title: 'Clinic added',
      description: `${clinic.name} is ready for doctors and production activity.`,
      type: 'success',
    })
  }

  function handleCreateDoctor(newDoctor: NewDoctor) {
    const clinic = clinics.find((item) => item.id === newDoctor.clinicId)
    const doctor: Doctor = {
      id: `doctor-${doctors.length + 1}`,
      fullName: newDoctor.name,
      specialty: newDoctor.specialty || null,
      email: newDoctor.email || null,
      phone: newDoctor.phoneNumber || null,
      address: newDoctor.address || null,
      country: newDoctor.country || null,
      notes: null,
      source: newDoctor.source,
      isActive: newDoctor.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      clinics: clinic ? [{ id: clinic.id, name: clinic.name }] : [],
    }

    setDoctors((currentDoctors) => [...currentDoctors, doctor])
    setSelectedClinicId(doctor.clinics[0]?.id ?? '')
    setViewMode('clinics')
    toast.add({
      title: 'Doctor invited',
      description: `${doctor.fullName} was added to your doctors list.`,
      type: 'success',
    })
  }

  function handleUpdateDoctor(values: DoctorFormValues) {
    if (!editingDoctor) {
      return
    }

    setDoctors((currentDoctors) =>
      currentDoctors.map((doctor) =>
        doctor.id === editingDoctor.id
          ? {
              ...doctor,
              fullName: values.name,
              specialty: values.specialty || null,
              email: values.email || null,
              address: values.address || null,
              country: values.country || null,
              phone: values.phoneNumber || null,
              source: values.source,
              isActive: values.isActive,
              updatedAt: new Date(),
              clinics: values.clinicId
                ? clinics
                    .filter((clinic) => clinic.id === values.clinicId)
                    .map((clinic) => ({ id: clinic.id, name: clinic.name }))
                : [],
            }
          : doctor,
      ),
    )
    setEditingDoctor(null)
  }

  function handleDeleteDoctor(doctorId: string) {
    setDoctors((currentDoctors) => currentDoctors.filter((doctor) => doctor.id !== doctorId))
  }

  function handleRevokePortalAccess(doctorId: string) {
    setDoctors((currentDoctors) =>
      currentDoctors.map((doctor) =>
        doctor.id === doctorId
          ? { ...doctor, isActive: false, updatedAt: new Date() }
          : doctor,
      ),
    )
  }

  function openEditDoctor(doctor: Doctor) {
    setEditingDoctor(doctor)
  }

  function openDoctorDetails(doctor: Doctor) {
    navigate(`/doctors/${doctor.id}`)
  }

  return (
    <Page size="full">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-surface p-2 ring-1 ring-inset ring-border-soft">
        <Tabs
          value={viewMode}
          onValueChange={(value) => {
            if (value === 'clinics' || value === 'doctors') {
              setViewMode(value)
            }
          }}
          aria-label="Choose doctors and clinics view"
          className="w-fit"
        >
          <TabsList>
            <TabsTrigger value="clinics">
              By clinic <span className="font-mono text-text-muted">({clinics.length})</span>
            </TabsTrigger>
            <TabsTrigger value="doctors">
              All doctors <span className="font-mono text-text-muted">({doctors.length})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="row">
          <InputGroup className="w-full sm:w-80" variant='outline'>
          <InputGroupAddon>
            <Search size={16} />
          </InputGroupAddon>
          <InputGroupInput
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
            placeholder="Search clinics or doctors"
            aria-label="Search clinics or doctors"
          />
        </InputGroup>
        {viewMode === 'doctors' && (
          <Button onClick={() => setIsCreateDoctorOpen(true)}>
            <Plus /> Add doctor
          </Button>
        )}
        <Button variant={viewMode === 'doctors' ? 'neutral' : 'default'} onClick={() => setIsCreateClinicOpen(true)}>
          <Plus /> Add clinic
        </Button>
        </div>
      </div>

      {viewMode === 'clinics' ? (
        <section className="grid min-w-0 gap-3 xl:grid-cols-[16rem_minmax(0,1fr)]">
          <ClinicList
            clinics={visibleClinics}
            doctors={doctors}
            selectedClinicId={activeClinicId}
            onSelectClinic={setSelectedClinicId}
          />
          {activeClinic ? (
            <ClinicDetails
              clinic={activeClinic}
              doctors={activeClinicDoctors}
              onAddDoctor={() => {
                setEditingDoctor(null)
                setIsCreateDoctorOpen(true)
              }}
              onDeleteDoctor={handleDeleteDoctor}
              onEditDoctor={openEditDoctor}
              onRevokePortalAccess={handleRevokePortalAccess}
              onViewDoctor={openDoctorDetails}
            />
          ) : (
            <EmptyState
              title="No clinic selected"
              description="Add a clinic or change your search to see its doctors."
            />
          )}
        </section>
      ) : (
        <Card size="sm">
          <CardHeader className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="normal-case">
              All doctors <span className="text-text-muted">({visibleDoctors.length})</span>
            </CardTitle>
            <div className="flex items-center gap-1 rounded-sm bg-surface-muted p-0.5" aria-label="Choose doctor display view">
              <Button type="button" size="icon-sm" variant={doctorDisplayMode === 'grid' ? 'default' : 'ghost'} aria-label="Show doctors as cards" aria-pressed={doctorDisplayMode === 'grid'} onClick={() => setDoctorDisplayMode('grid')}><LayoutGrid /></Button>
              <Button type="button" size="icon-sm" variant={doctorDisplayMode === 'table' ? 'default' : 'ghost'} aria-label="Show doctors as table" aria-pressed={doctorDisplayMode === 'table'} onClick={() => setDoctorDisplayMode('table')}><List /></Button>
            </div>
          </CardHeader>
          {visibleDoctors.length > 0 ? (
            doctorDisplayMode === 'table' ? (
              <DoctorTable
                doctors={visibleDoctors}
                getClinicName={(doctor) => doctor.clinics[0]?.name}
                onDelete={(doctor) => handleDeleteDoctor(doctor.id)}
                onEdit={openEditDoctor}
                onRevokePortalAccess={(doctor) => handleRevokePortalAccess(doctor.id)}
                onView={openDoctorDetails}
              />
            ) : (
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    clinicName={doctor.clinics[0]?.name}
                    showClinic
                    onDelete={() => handleDeleteDoctor(doctor.id)}
                    onEdit={() => openEditDoctor(doctor)}
                    onRevokePortalAccess={() => handleRevokePortalAccess(doctor.id)}
                    onClick={() => openDoctorDetails(doctor)}
                  />
                ))}
              </div>
            )
          ) : (
            <EmptyState
              title="No doctors found"
              description="Try a different search or invite a new doctor."
            />
          )}
        </Card>
      )}

      <CreateClinicDialog
        open={isCreateClinicOpen}
        onOpenChange={setIsCreateClinicOpen}
        existingNames={clinics.map((clinic) => clinic.name)}
        onCreate={handleCreateClinic}
      />
      <CreateDoctorDialog
        open={isCreateDoctorOpen}
        onOpenChange={setIsCreateDoctorOpen}
        clinics={clinics}
        initialClinicId={activeClinicId}
        onCreate={handleCreateDoctor}
      />
      <DoctorFormDialog
        key={editingDoctor?.id ?? 'new-doctor-edit-form'}
        clinics={clinics}
        doctor={editingDoctor ?? undefined}
        mode="edit"
        onOpenChange={(open) => {
          if (!open) {
            setEditingDoctor(null)
          }
        }}
        onSubmit={handleUpdateDoctor}
        open={editingDoctor !== null}
      />
    </Page>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-md bg-surface px-4 py-8 text-center ring-1 ring-inset ring-border-soft">
      <p className="text-sm font-semibold text-text">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>
    </div>
  )
}
