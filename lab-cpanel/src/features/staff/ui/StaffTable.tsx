import { MoreHorizontal, PauseCircle, Pencil, PlayCircle } from 'lucide-react'

import { Badge, type BadgeTone } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { DataTable, DataTableEmptyState, type DataTableColumn } from '../../../shared/ui/data-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../shared/ui/DropdownMenu'
import { getInitials } from '../../../shared/lib/string/getInitials'
import { getStaffStatusLabel, type Staff, type StaffStatus } from '../domain/staff'
import type { Role } from '../../roles-permissions/domain/role'

const statusTones: Record<StaffStatus, BadgeTone> = {
  active: 'success',
  suspended: 'destructive',
}

type StaffTableProps = {
  staff: Staff[]
  roles: Role[]
  title?: string
  onEdit: (member: Staff) => void
  onStatusChange: (member: Staff, status: StaffStatus) => void
}

export function StaffTable({ onEdit, onStatusChange, roles, staff, title }: StaffTableProps) {
  const roleNames = new Map(roles.map((role) => [role.id, role.name]))
  const columns: DataTableColumn<Staff>[] = [
    {
      id: 'staff',
      header: 'Staff member',
      sortable: true,
      accessorKey: 'name',
      className: 'font-semibold text-text',
      cell: (member) => (
        <div className="flex items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">{getInitials(member.name)}</span>
          <div className="grid gap-0.5">
            <span className="font-semibold text-text">{member.name}</span>
            <a href={`mailto:${member.email}`} className="text-xs font-normal text-primary hover:underline">{member.email}</a>
          </div>
        </div>
      ),
    },
    { id: 'role', header: 'Role', sortable: true, sortValue: (member) => roleNames.get(member.roleId) ?? member.roleId, cell: (member) => <span className="text-secondary">{roleNames.get(member.roleId) ?? member.roleId}</span> },
    { id: 'status', header: 'Status', sortable: true, accessorKey: 'status', cell: (member) => <Badge tone={statusTones[member.status]}>{getStaffStatusLabel(member.status)}</Badge> },
    { id: 'createdAt', header: 'Created at', accessorKey: 'createdAt', className: 'text-secondary' },
    {
      id: 'actions',
      header: 'Actions',
      sortable: false,
      pinnable: false,
      className: 'w-12 text-end',
      cell: (member) => (
        member.roleId === 'owner' ? (
          <Badge tone="info">Owner</Badge>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="neutral" size="icon-sm" aria-label={`Actions for ${member.name}`} />}><MoreHorizontal /></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(member)}><Pencil /> Edit staff</DropdownMenuItem>
              {member.status === 'suspended' ? (
                <DropdownMenuItem onClick={() => onStatusChange(member, 'active')}><PlayCircle /> Restore access</DropdownMenuItem>
              ) : (
                <DropdownMenuItem variant="destructive" onClick={() => onStatusChange(member, 'suspended')}><PauseCircle /> Suspend access</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={staff}
      emptyState={
        <DataTableEmptyState
          title="No staff members match your search"
          description="Try another name or email address."
        />
      }
      getRowId={(member) => member.id}
      title={title}
      description="Manage access and roles for your lab team."
    />
  )
}
