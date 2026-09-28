import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '../../../shared/ui/Button'
import { AppHeader, AppHeaderActions } from '../../../shared/ui/AppHeader'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../../../shared/ui/InputGroup'
import { Page } from '../../../shared/ui/Page'
import { toast } from '../../../shared/ui/Toast'
import { clinicFixtures } from '../data/clinics'
import { doctorFixtures } from '../../doctors/data/doctors'
import { filterClinics } from '../domain/clinic'
import type { Clinic } from '../domain/clinic'
import { CreateClinicDialog, type NewClinic } from './CreateClinicDialog'
import { ClinicTable } from './ClinicTable'

export function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>(clinicFixtures)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const visibleClinics = useMemo(
    () => filterClinics(clinics, doctorFixtures, searchTerm),
    [clinics, searchTerm],
  )

  function getDoctorCount(clinic: Clinic) {
    return doctorFixtures.filter((doctor) => doctor.clinicId === clinic.id).length
  }

  function handleCreateClinic(newClinic: NewClinic) {
    const clinic: Clinic = { ...newClinic, id: `clinic-${clinics.length + 1}` }
    setClinics((currentClinics) => [...currentClinics, clinic])
    setIsCreateOpen(false)
    toast.add({ title: 'Clinic added', description: `${clinic.name} is ready for doctors.`, type: 'success' })
  }

  return (
    <Page size="full">
      <AppHeader title="Clinics" description="Manage clinic contacts and the doctors linked to each clinic.">
        <AppHeaderActions>
          <InputGroup className="w-64" variant="outline">
            <InputGroupAddon><Search /></InputGroupAddon>
            <InputGroupInput value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} placeholder="Search clinics" aria-label="Search clinics" />
          </InputGroup>
          <Button onClick={() => setIsCreateOpen(true)}><Plus /> Add clinic</Button>
        </AppHeaderActions>
      </AppHeader>

      <ClinicTable clinics={visibleClinics} getDoctorCount={getDoctorCount} title={`All clinics (${visibleClinics.length})`} />

      <CreateClinicDialog
        existingNames={clinics.map((clinic) => clinic.name)}
        onCreate={handleCreateClinic}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
    </Page>
  )
}
