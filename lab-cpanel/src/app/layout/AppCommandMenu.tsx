import { useHotkey } from '@tanstack/react-hotkeys'
import { useState } from 'react'
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

import { useAppliances } from '../../features/appliances/queries/appliance.queries'
import { useStaff } from '../../features/staff/queries/staff.queries'
import { useCases } from '../../features/case-pipeline'
import { useClinicOptions } from '../../features/clinics/queries/clinic.queries'
import { useDoctors } from '../../features/doctors/queries/doctor.queries'
import { getApiErrorMessage } from '../../shared/api/apiError'
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
  const clinicsQuery = useClinicOptions()
  const staffQuery = useStaff(undefined, open)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm.trim())
  const casesQuery = useCases(
    debouncedSearchTerm || undefined,
    open && Boolean(debouncedSearchTerm),
  )
  const appliancesQuery = useAppliances(debouncedSearchTerm)
  const doctorsQuery = useDoctors(
    debouncedSearchTerm,
    Boolean(debouncedSearchTerm),
  )

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
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/doctors')}>
              <Stethoscope /> Doctors
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/clinics')}>
              <Building2 /> Clinics
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/cases')}>
              <ClipboardList /> Cases
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

          {debouncedSearchTerm && (
            <CommandGroup heading="Clinics">
            {(clinicsQuery.data ?? [])
              .filter((clinic) => clinic.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
              .map((clinic) => (
              <CommandItem
                key={clinic.id}
                value={`${clinic.name} clinic`}
                onSelect={() => navigateTo('/clinics')}
              >
                <Building2 />
                <span>{clinic.name}</span>
                <CommandShortcut>Clinic</CommandShortcut>
              </CommandItem>
              ))}
            </CommandGroup>
          )}

          {debouncedSearchTerm && (
            <CommandGroup heading="Doctors">
            {doctorsQuery.isPending && (
              <CommandItem disabled>Searching doctors…</CommandItem>
            )}
            {doctorsQuery.isError && (
              <CommandItem disabled>
                {getApiErrorMessage(doctorsQuery.error, 'Unable to search doctors.')}
              </CommandItem>
            )}
            {(doctorsQuery.data?.data ?? []).map((doctor) => (
              <CommandItem
                key={doctor.id}
                value={`${doctor.fullName} doctor ${doctor.specialty ?? ''} ${doctor.email ?? ''}`}
                onSelect={() => navigateTo(`/doctors/${doctor.id}`)}
              >
                <Stethoscope />
                <span>{doctor.fullName}</span>
                <CommandShortcut>{doctor.specialty ?? 'Doctor'}</CommandShortcut>
              </CommandItem>
            ))}
            {doctorsQuery.data?.data.length === 0 && (
              <CommandItem disabled>No matching doctors.</CommandItem>
            )}
            </CommandGroup>
          )}

          {debouncedSearchTerm && (
            <CommandGroup heading="Cases">
            {casesQuery.isPending && (
              <CommandItem disabled>Searching cases…</CommandItem>
            )}
            {casesQuery.isError && (
              <CommandItem disabled>
                {getApiErrorMessage(casesQuery.error, 'Unable to search cases.')}
              </CommandItem>
            )}
            {(casesQuery.data ?? []).map((caseItem) => (
              <CommandItem
                key={caseItem.id}
                value={`${caseItem.id} case ${caseItem.patientName} ${caseItem.clinicName} ${caseItem.doctorName} ${caseItem.patientCode}`}
                onSelect={() => navigateTo(`/cases/${caseItem.id}`)}
              >
                <ClipboardList />
                <span>{caseItem.id} · {caseItem.patientName}</span>
                <CommandShortcut>{caseItem.caseType}</CommandShortcut>
              </CommandItem>
            ))}
            {!casesQuery.isPending && !casesQuery.isError && casesQuery.data?.length === 0 && (
              <CommandItem disabled>No matching cases.</CommandItem>
            )}
            </CommandGroup>
          )}

          <CommandGroup heading="Appliances">
            {appliancesQuery.isPending && (
              <CommandItem disabled>Loading appliances…</CommandItem>
            )}
            {appliancesQuery.isError && (
              <CommandItem disabled>
                {getApiErrorMessage(appliancesQuery.error, 'Unable to load appliances.')}
              </CommandItem>
            )}
            {(appliancesQuery.data ?? []).map((appliance) => (
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
            {staffQuery.isPending && <CommandItem disabled>Loading staff…</CommandItem>}
            {staffQuery.isError && (
              <CommandItem disabled>
                {getApiErrorMessage(staffQuery.error, 'Unable to load staff members.')}
              </CommandItem>
            )}
            {(staffQuery.data?.data ?? []).map((member) => (
              <CommandItem
                key={member.id}
                value={`${member.fullName} staff ${member.email} ${member.roles.map((role) => role.name).join(' ')}`}
                onSelect={() => navigateTo('/staff')}
              >
                <UsersRound />
                <span>{member.fullName}</span>
                <CommandShortcut>{member.roles.map((role) => role.name).join(', ')}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
