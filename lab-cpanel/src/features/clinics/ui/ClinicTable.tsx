import { Mail, Phone } from 'lucide-react'

import { DataTable, type DataTableColumn } from '../../../shared/ui/data-table'
import type { Clinic } from '../domain/clinic'

type ClinicTableProps = {
  clinics: Clinic[]
  getDoctorCount: (clinic: Clinic) => number
  title?: string
}

export function ClinicTable({ clinics, getDoctorCount, title }: ClinicTableProps) {
  const columns: DataTableColumn<Clinic>[] = [
    {
      id: 'clinic',
      header: 'Clinic',
      accessorKey: 'name',
      className: 'font-semibold text-text',
    },
    { id: 'address', header: 'Address', accessorKey: 'address', className: 'text-secondary' },
    {
      id: 'contact',
      header: 'Contact',
      sortValue: (clinic) => clinic.email,
      cell: (clinic) => (
        <div className="grid gap-0.5 text-sm">
          <a href={`mailto:${clinic.email}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Mail size={13} /> {clinic.email}</a>
          <a href={`tel:${clinic.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Phone size={13} /> {clinic.phone}</a>
        </div>
      ),
    },
    {
      id: 'doctors',
      header: 'Doctors',
      sortValue: getDoctorCount,
      cell: (clinic) => <span className="text-secondary"><strong className="text-text">{getDoctorCount(clinic)}</strong> active</span>,
    },
  ]

  return <DataTable columns={columns} data={clinics} emptyMessage="No clinics match your search." getRowId={(clinic) => clinic.id} title={title} />
}
