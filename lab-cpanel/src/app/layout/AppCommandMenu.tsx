import { formatForDisplay, useHotkey } from '@tanstack/react-hotkeys'
import { useEffect, useState } from 'react'
import {
  Building2,
  ClipboardList,
  FilePlus2,
  FileText,
  LayoutDashboard,
  Plus,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  UsersRound,
  Workflow,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { appliances } from '../../features/appliances/data/appliances'
import { staffFixtures } from '../../features/staff/data/staff'
import { roleFixtures } from '../../features/roles-permissions/data/roles'
import type { DashboardCase } from '../../features/dashboard/domain/case'
import type { Clinic } from '../../features/clinics/domain/clinic'
import type { Doctor } from '../../features/doctors/domain/doctor'
import { useDebounce } from '../../shared/lib/time/useDebounce'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '../../shared/ui/Command'

type AppCommandMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppCommandMenu({ open, onOpenChange }: AppCommandMenuProps) {
  const navigate = useNavigate()
  const roleNames = new Map(roleFixtures.map((role) => [role.id, role.name]))
  const [searchTerm, setSearchTerm] = useState('')
  const [searchRecords, setSearchRecords] = useState<{
    query: string
    clinics: Clinic[]
    doctors: Doctor[]
    cases: DashboardCase[]
  }>()
  const debouncedSearchTerm = useDebounce(searchTerm.trim())

  useEffect(() => {
    if (!debouncedSearchTerm) {
      return
    }

    let cancelled = false
    Promise.all([
      import('../../features/clinics/data/clinics'),
      import('../../features/doctors/data/doctors'),
      import('../../features/dashboard/data/cases'),
    ])
      .then(([clinicsModule, doctorsModule, casesModule]) => {
        if (cancelled) return

        setSearchRecords({
          query: debouncedSearchTerm,
          clinics: clinicsModule.clinicFixtures,
          doctors: doctorsModule.doctorFixtures,
          cases: casesModule.caseFixtures,
        })
      })

    return () => {
      cancelled = true
    }
  }, [debouncedSearchTerm])

  useHotkey('Mod+K', (event) => {
    event.preventDefault()
    onOpenChange(!open)
  })

  function navigateTo(path: string) {
    navigate(path)
    onOpenChange(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput
          placeholder="Search clinics, doctors, cases, appliances..."
          autoFocus
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>No matching records or actions.</CommandEmpty>

          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => navigateTo('/')}>
              <LayoutDashboard /> Dashboard
              <CommandShortcut>{formatForDisplay('G D')}</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/doctors')}>
              <Stethoscope /> Doctors
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/clinics')}>
              <Building2 /> Clinics
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/cases')}>
              <ClipboardList /> Cases
              <CommandShortcut>{formatForDisplay('G C')}</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/appliances')}>
              <SlidersHorizontal /> Appliances &amp; fields
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/appliance-workflow-templates')}>
              <Workflow /> Workflow templates
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/policies')}>
              <FileText /> Policies &amp; terms
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/settings')}>
              <Settings /> Settings
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/lab-profile')}>
              <Building2 /> Lab profile
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/staff')}>
              <UsersRound /> Staff
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/roles-permissions')}>
              <ShieldCheck /> Roles &amp; permissions
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Actions">
            <CommandItem value="create new case" onSelect={() => navigateTo('/cases/new')}>
              <FilePlus2 /> Create case
            </CommandItem>
            <CommandItem value="view lab policies" onSelect={() => navigateTo('/policies')}>
              <FileText /> View lab policies
            </CommandItem>
            <CommandItem value="create add appliance type" onSelect={() => navigateTo('/appliances')}>
              <Plus /> Add appliance type
            </CommandItem>
            <CommandItem value="create add clinic" onSelect={() => navigateTo('/clinics')}>
              <Plus /> Add clinic
            </CommandItem>
            <CommandItem value="create invite doctor" onSelect={() => navigateTo('/doctors')}>
              <Stethoscope /> Invite doctor
            </CommandItem>
            <CommandItem value="create add staff member" onSelect={() => navigateTo('/staff')}>
              <UsersRound /> Add staff member
            </CommandItem>
            <CommandItem value="create add role" onSelect={() => navigateTo('/roles-permissions')}>
              <ShieldCheck /> Add role
            </CommandItem>
            <CommandItem value="create workflow template" onSelect={() => navigateTo('/appliance-workflow-templates')}>
              <Workflow /> Create workflow template
            </CommandItem>
          </CommandGroup>

          {debouncedSearchTerm && searchRecords?.query === debouncedSearchTerm && (
            <CommandGroup heading="Clinics">
            {searchRecords.clinics.map((clinic) => (
              <CommandItem
                key={clinic.id}
                value={`${clinic.name} clinic ${clinic.address}`}
                onSelect={() => navigateTo('/clinics')}
              >
                <Building2 />
                <span>{clinic.name}</span>
                <CommandShortcut>Clinic</CommandShortcut>
              </CommandItem>
            ))}
            </CommandGroup>
          )}

          {debouncedSearchTerm && searchRecords?.query === debouncedSearchTerm && (
            <CommandGroup heading="Doctors">
            {searchRecords.doctors.map((doctor) => (
              <CommandItem
                key={doctor.id}
                value={`${doctor.name} doctor ${doctor.specialty} ${doctor.email}`}
                onSelect={() => navigateTo(`/doctors/${doctor.id}`)}
              >
                <Stethoscope />
                <span>{doctor.name}</span>
                <CommandShortcut>{doctor.specialty}</CommandShortcut>
              </CommandItem>
            ))}
            </CommandGroup>
          )}

          {debouncedSearchTerm && searchRecords?.query === debouncedSearchTerm && (
            <CommandGroup heading="Cases">
            {searchRecords.cases.map((caseItem) => (
              <CommandItem
                key={caseItem.id}
                value={`${caseItem.id} case ${caseItem.patientName} ${caseItem.clinic}`}
                onSelect={() => navigateTo(`/cases/${caseItem.id}`)}
              >
                <ClipboardList />
                <span>{caseItem.id} · {caseItem.patientName}</span>
                <CommandShortcut>{caseItem.caseType}</CommandShortcut>
              </CommandItem>
            ))}
            </CommandGroup>
          )}

          {debouncedSearchTerm && searchRecords?.query !== debouncedSearchTerm && <CommandGroup heading="Records"><CommandItem disabled>Searching records…</CommandItem></CommandGroup>}

          <CommandGroup heading="Appliances">
            {appliances.map((appliance) => (
              <CommandItem
                key={appliance.id}
                value={`${appliance.name} appliance fields`}
                onSelect={() => navigateTo(`/appliances/${appliance.id}`)}
              >
                <SlidersHorizontal />
                <span>{appliance.name}</span>
                <CommandShortcut>Appliance</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Staff">
            {staffFixtures.map((member) => (
              <CommandItem
                key={member.id}
                value={`${member.name} staff ${member.email} ${member.roleId}`}
                onSelect={() => navigateTo('/staff')}
              >
                <UsersRound />
                <span>{member.name}</span>
                <CommandShortcut>{roleNames.get(member.roleId) ?? member.roleId}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
