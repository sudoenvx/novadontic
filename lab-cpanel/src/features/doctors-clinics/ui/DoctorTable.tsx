import { Mail, MoreHorizontal, Pencil, ShieldOff, Trash2 } from 'lucide-react'

import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../shared/ui/DropdownMenu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/Table'
import type { Doctor } from '../domain/doctor'
import { DoctorPortalStatusBadge } from './DoctorPortalStatusBadge'
import { PersonAvatar } from './PersonAvatar'

type DoctorTableProps = {
  doctors: Doctor[]
  getClinicName: (doctor: Doctor) => string | undefined
  onDelete: (doctor: Doctor) => void
  onEdit: (doctor: Doctor) => void
  onRevokePortalAccess: (doctor: Doctor) => void
  onView: (doctor: Doctor) => void
}

export function DoctorTable({ doctors, getClinicName, onDelete, onEdit, onRevokePortalAccess, onView }: DoctorTableProps) {
  return (
    <Card size="sm" className="overflow-x-auto">
      <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow>
            <TableHead>Doctor</TableHead>
            <TableHead>Clinic</TableHead>
            <TableHead>Portal access</TableHead>
            <TableHead>Active cases</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-10"><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.id}>
              <TableCell>
                <button type="button" className="flex items-center gap-2 text-left" onClick={() => onView(doctor)}>
                  <PersonAvatar name={doctor.name} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-text">{doctor.name}</span>
                    <span className="block truncate text-xs text-text-muted">{doctor.specialty}</span>
                  </span>
                </button>
              </TableCell>
              <TableCell className="text-sm text-secondary">{getClinicName(doctor) ?? 'No clinic assigned'}</TableCell>
              <TableCell><DoctorPortalStatusBadge status={doctor.status} /></TableCell>
              <TableCell className="text-sm text-secondary"><strong className="text-text">{doctor.activeCases}</strong> {doctor.activeCases === 1 ? 'case' : 'cases'}</TableCell>
              <TableCell>
                <a href={`mailto:${doctor.email}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline"><Mail size={13} /> {doctor.email}</a>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`More actions for ${doctor.name}`} />}><MoreHorizontal /></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(doctor)}><Pencil /> Edit doctor</DropdownMenuItem>
                    <DropdownMenuItem disabled={doctor.status === 'inactive'} onClick={() => onRevokePortalAccess(doctor)}><ShieldOff /> Revoke portal access</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(doctor)}><Trash2 /> Delete doctor</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
