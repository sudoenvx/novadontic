import { Check, Mail, MoreHorizontal, Pencil, Phone, Power } from 'lucide-react'

import { Button } from '../../../shared/ui/Button'
import { DataTable, type DataTableColumn } from '../../../shared/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../shared/ui/DropdownMenu'
import type { Clinic } from '../domain/clinic'

type ClinicTableProps = {
  clinics: Clinic[]
  onEdit: (clinic: Clinic) => void
  onSetActive: (clinic: Clinic) => void
  title?: string
}

export function ClinicTable({
  clinics,
  onEdit,
  onSetActive,
  title,
}: ClinicTableProps) {
  const columns: DataTableColumn<Clinic>[] = [
    {
      id: 'clinic',
      header: 'Clinic',
      sortable: true,
      accessorKey: 'name',
      className: 'font-semibold text-text',
    },
    {
      id: 'address',
      header: 'Address',
      cell: (clinic) => {
        const address = [clinic.address, clinic.city].filter(Boolean).join(', ')
        return <span className="text-secondary">{address || 'Not provided'}</span>
      },
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: (clinic) => (
        <div className="grid gap-0.5 text-sm">
          {clinic.email ? (
            <a href={`mailto:${clinic.email}`} className="inline-flex items-center gap-1 text-primary hover:underline">
              <Mail size={13} /> {clinic.email}
            </a>
          ) : <span className="text-text-muted">Email not provided</span>}
          {clinic.phone ? (
            <a href={`tel:${clinic.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
              <Phone size={13} /> {clinic.phone}
            </a>
          ) : <span className="text-text-muted">Phone not provided</span>}
        </div>
      ),
    },
    {
      id: 'doctors',
      header: 'Doctors',
      sortable: true,
      sortValue: (clinic) => clinic.doctors.filter((doctor) => doctor.isActive).length,
      cell: (clinic) => {
        const activeDoctorCount = clinic.doctors.filter((doctor) => doctor.isActive).length
        return <span className="text-secondary"><strong className="text-text">{activeDoctorCount}</strong> active</span>
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: (clinic) => (
        <span className={clinic.isActive ? 'text-success' : 'text-text-muted'}>
          {clinic.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'w-10',
      className: 'w-10',
      cell: (clinic) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${clinic.name}`}
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(clinic)}>
              <Pencil /> Edit clinic
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSetActive(clinic)}>
              {clinic.isActive ? <Power /> : <Check />}
              {clinic.isActive ? 'Deactivate clinic' : 'Reactivate clinic'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={clinics}
      emptyMessage="No clinics match your search."
      getRowId={(clinic) => clinic.id}
      title={title}
    />
  )
}
