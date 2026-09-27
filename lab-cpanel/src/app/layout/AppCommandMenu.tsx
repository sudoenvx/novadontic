import { formatForDisplay, useHotkey } from '@tanstack/react-hotkeys'
import {
  Building2,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  Plus,
  Settings,
  SlidersHorizontal,
  Stethoscope,
  Workflow,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { appliances } from '../../features/appliances/data/appliances'
import { caseFixtures } from '../../features/dashboard/data/cases'
import { clinicFixtures } from '../../features/doctors-clinics/data/clinics'
import { doctorFixtures } from '../../features/doctors-clinics/data/doctors'
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
        <CommandInput placeholder="Search clinics, doctors, cases, appliances..." autoFocus />
        <CommandList>
          <CommandEmpty>No matching records or actions.</CommandEmpty>

          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => navigateTo('/')}>
              <LayoutDashboard /> Dashboard
              <CommandShortcut>{formatForDisplay('G D')}</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/doctors-clinics')}>
              <Building2 /> Doctors &amp; clinics
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/cases')}>
              <ClipboardList /> Case pipeline
              <CommandShortcut>{formatForDisplay('G C')}</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/appliances')}>
              <SlidersHorizontal /> Appliances &amp; fields
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/appliance-workflow-templates')}>
              <Workflow /> Workflow templates
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/settings')}>
              <Settings /> Settings
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Actions">
            <CommandItem value="create new case" onSelect={() => navigateTo('/cases')}>
              <FilePlus2 /> Create case
            </CommandItem>
            <CommandItem value="create add appliance type" onSelect={() => navigateTo('/appliances')}>
              <Plus /> Add appliance type
            </CommandItem>
            <CommandItem value="create add clinic" onSelect={() => navigateTo('/doctors-clinics')}>
              <Plus /> Add clinic
            </CommandItem>
            <CommandItem value="create invite doctor" onSelect={() => navigateTo('/doctors-clinics')}>
              <Stethoscope /> Invite doctor
            </CommandItem>
            <CommandItem value="create workflow template" onSelect={() => navigateTo('/appliance-workflow-templates')}>
              <Workflow /> Create workflow template
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Clinics">
            {clinicFixtures.map((clinic) => (
              <CommandItem
                key={clinic.id}
                value={`${clinic.name} clinic ${clinic.address}`}
                onSelect={() => navigateTo('/doctors-clinics')}
              >
                <Building2 />
                <span>{clinic.name}</span>
                <CommandShortcut>Clinic</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Doctors">
            {doctorFixtures.map((doctor) => (
              <CommandItem
                key={doctor.id}
                value={`${doctor.name} doctor ${doctor.specialty} ${doctor.email}`}
                onSelect={() => navigateTo(`/doctors-clinics/doctors/${doctor.id}`)}
              >
                <Stethoscope />
                <span>{doctor.name}</span>
                <CommandShortcut>{doctor.specialty}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Cases">
            {caseFixtures.map((caseItem) => (
              <CommandItem
                key={caseItem.id}
                value={`${caseItem.id} case ${caseItem.patientName} ${caseItem.clinic}`}
                onSelect={() => navigateTo('/cases')}
              >
                <ClipboardList />
                <span>{caseItem.id} · {caseItem.patientName}</span>
                <CommandShortcut>{caseItem.caseType}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

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
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
