import { MoreHorizontal, PauseCircle, Pencil, PlayCircle, Trash2 } from 'lucide-react'

import { Badge, type BadgeTone } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import {
  DataTable,
  DataTableEmptyState,
  type DataTableColumn,
} from '../../../shared/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../shared/ui/DropdownMenu'
import { getInitials } from '../../../shared/lib/string/getInitials'
import { getStaffStatus, getStaffStatusLabel, isOwner, type Staff } from '../domain/staff'

const statusTones: Record<'active' | 'suspended', BadgeTone> = {
  active: 'success',
  suspended: 'destructive',
}

type StaffTableProps = {
  staff: Staff[]
  loading?: boolean
  title?: string
  onEdit: (member: Staff) => void
  onDelete: (member: Staff) => void
  onStatusChange: (member: Staff, isActive: boolean) => void
}

export function StaffTable({
  loading = false,
  onDelete,
  onEdit,
  onStatusChange,
  staff,
  title,
}: StaffTableProps) {
  const columns: DataTableColumn<Staff>[] = [
    {
      id: 'staff',
      header: 'Staff member',
      sortable: true,
      accessorKey: 'fullName',
      className: 'font-semibold text-text',
      cell: (member) => (
        <div className="flex items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
            {getInitials(member.fullName)}
          </span>
          <div className="grid gap-0.5">
            <span className="font-semibold text-text">{member.fullName}</span>
            <a href={`mailto:${member.email}`} className="text-xs font-normal text-primary hover:underline">
              {member.email}
            </a>
          </div>
        </div>
      ),
    },
    {
      id: 'roles',
      header: 'Roles',
      sortable: true,
      sortValue: (member) => member.roles.map((role) => role.name).join(', '),
      cell: (member) => (
        <div className="flex flex-wrap gap-1">
          {member.roles.map((role) => (
            <Badge key={role.id} tone="neutral">{role.name}</Badge>
          ))}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (member) => getStaffStatus(member),
      cell: (member) => {
        const status = getStaffStatus(member)
        return <Badge tone={statusTones[status]}>{getStaffStatusLabel(status)}</Badge>
      },
    },
    {
      id: 'createdAt',
      header: 'Created at',
      sortable: true,
      sortValue: (member) => member.createdAt.getTime(),
      cell: (member) => (
        <span className="text-secondary">
          {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(member.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      sortable: false,
      pinnable: false,
      showInColumnVisualizer: false,
      className: 'w-12 text-end',
      cell: (member) => isOwner(member) ? (
        <Badge tone="info">Owner</Badge>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="neutral" size="icon-sm" aria-label={`Actions for ${member.fullName}`} />}
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(member)}>
              <Pencil /> Edit staff
            </DropdownMenuItem>
            {member.isActive ? (
              <DropdownMenuItem variant="destructive" onClick={() => onStatusChange(member, false)}>
                <PauseCircle /> Suspend access
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onStatusChange(member, true)}>
                <PlayCircle /> Restore access
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(member)}>
              <Trash2 /> Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={staff}
      persistenceKey="staff-list"
      emptyState={
        <DataTableEmptyState
          title="No staff members match your search"
          description="Try another name, email, or phone number."
        />
      }
      getRowId={(member) => member.id}
      loading={loading}
      title={title}
      description="Manage user accounts, access, and assigned roles."
    />
  )
}
