import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '../../../shared/ui/Button'
import { AppHeader, AppHeaderActions } from '../../../shared/ui/AppHeader'
import { Card } from '../../../shared/ui/Card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../../../shared/ui/InputGroup'
import { Page } from '../../../shared/ui/Page'
import { toast } from '../../../shared/ui/Toast'
import { staffFixtures } from '../data/staff'
import { filterStaff } from '../domain/staff'
import type { Staff, StaffStatus } from '../domain/staff'
import { roleFixtures } from '../../roles-permissions/data/roles'
import { StaffFormDialog, type StaffFormValues } from './StaffFormDialog'
import { StaffTable } from './StaffTable'

export function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>(staffFixtures)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff>()
  const visibleStaff = useMemo(() => filterStaff(staff, searchTerm), [staff, searchTerm])

  function handleCreate(values: StaffFormValues) {
    const member: Staff = {
      ...values,
      id: `staff-${staff.length + 1}`,
      status: 'active',
      createdAt: 'Today',
    }
    setStaff((currentStaff) => [...currentStaff, member])
    setIsFormOpen(false)
    toast.add({ title: 'Staff member added', description: `${member.name} now has access to the lab workspace.`, type: 'success' })
  }

  function handleUpdate(values: StaffFormValues) {
    if (!editingStaff) return

    setStaff((currentStaff) => currentStaff.map((member) => member.id === editingStaff.id ? { ...member, ...values } : member))
    setEditingStaff(undefined)
    toast.add({ title: 'Staff profile updated', type: 'success' })
  }

  function handleStatusChange(member: Staff, status: StaffStatus) {
    setStaff((currentStaff) => currentStaff.map((item) => item.id === member.id ? { ...item, status } : item))
    toast.add({ title: status === 'suspended' ? 'Staff access suspended' : 'Staff access restored', type: 'success' })
  }

  const activeCount = staff.filter((member) => member.status === 'active').length
  const suspendedCount = staff.filter((member) => member.status === 'suspended').length

  return (
    <Page size="full">
      <AppHeader title="Staff" description="Manage the people who operate your lab workspace.">
        <AppHeaderActions>
          <InputGroup className="w-64" variant="outline">
            <InputGroupAddon><Search /></InputGroupAddon>
            <InputGroupInput value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} placeholder="Search staff" aria-label="Search staff" />
          </InputGroup>
          <Button onClick={() => { setEditingStaff(undefined); setIsFormOpen(true) }}><Plus /> Add staff</Button>
        </AppHeaderActions>
      </AppHeader>

      <div className="grid gap-3 sm:grid-cols-2">
        <StaffMetric label="Active staff" value={activeCount} tone="text-primary" />
        <StaffMetric label="Suspended access" value={suspendedCount} tone="text-secondary" />
      </div>

      <StaffTable
        staff={visibleStaff}
        roles={roleFixtures}
        onEdit={setEditingStaff}
        onStatusChange={handleStatusChange}
        title={`All staff (${visibleStaff.length})`}
      />

      <StaffFormDialog
        key={editingStaff?.id ?? 'new-staff-form'}
        mode={editingStaff ? 'edit' : 'create'}
        open={isFormOpen || editingStaff !== undefined}
        staff={editingStaff}
        roles={roleFixtures}
        onOpenChange={(open) => { if (!open) { setIsFormOpen(false); setEditingStaff(undefined) } }}
        onSubmit={editingStaff ? handleUpdate : handleCreate}
      />
    </Page>
  )
}

function StaffMetric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <Card className="gap-0"><p className={`text-lg font-semibold ${tone}`}>{value}</p><p className="text-2xs font-medium uppercase tracking-wide text-text-muted">{label}</p></Card>
}
