import { Mail, MoreHorizontal, Pencil, ShieldOff, Trash2 } from "lucide-react";

import { Button } from "../../../shared/ui/Button";
import { DataTable, type DataTableColumn } from "../../../shared/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../shared/ui/DropdownMenu";
import type { Doctor } from "../domain/doctor";
import { DoctorPortalStatusBadge } from "./DoctorPortalStatusBadge";

type DoctorTableProps = {
  doctors: Doctor[];
  loading?: boolean;
  getClinicName: (doctor: Doctor) => string | undefined;
  onDelete: (doctor: Doctor) => void;
  onEdit: (doctor: Doctor) => void;
  onRevokePortalAccess: (doctor: Doctor) => void;
  onView: (doctor: Doctor) => void;
  title?: string;
  description?: string;
};

export function DoctorTable({
  description,
  doctors,
  loading = false,
  getClinicName,
  onDelete,
  onEdit,
  onRevokePortalAccess,
  onView,
  title,
}: DoctorTableProps) {
  const columns: DataTableColumn<Doctor>[] = [
    {
      id: "doctor",
      header: "Doctor",
      sortable: true,
      pinnable: true,
      sortValue: (doctor) => doctor.fullName,
      cell: (doctor) => (
        <button
          type="button"
          className="flex items-center gap-2 text-left"
          onClick={() => onView(doctor)}
        >
          <span>
            <span className="block truncate font-semibold text-text">
              {doctor.fullName}
            </span>
            <span className="block truncate text-xs text-text-muted">
              {doctor.specialty ?? 'No specialty provided'}
            </span>
          </span>
        </button>
      ),
    },
    {
      id: "source",
      header: "Added via",
      cell: (doctor) => (
        <span className="text-sm text-secondary">
          {doctor.source === "portal"
            ? "Website / portal"
            : (getClinicName(doctor) ?? doctor.clinics[0]?.name ?? "No clinic assigned")}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (doctor) => <DoctorPortalStatusBadge isActive={doctor.isActive} />,
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
      cell: (doctor) => (
        doctor.email ? (
            <a
              href={`mailto:${doctor.email}`}
              className="inline-flex items-center gap-1 text-sm text-primary-hover hover:underline"
            >
              <Mail size={13} /> {doctor.email}
            </a>
          ) : (
            <span className="text-sm text-text-muted">Not provided</span>
          )
      ),
    },
    {
      id: "phone",
      header: "Phone",
      accessorKey: "phone",
      cell: (doctor) => (
        doctor.phone ? (
            <a
              href={`tel:${doctor.phone}`}
              className="text-sm text-primary-hover hover:underline"
            >
              {doctor.phone}
            </a>
          ) : (
            <span className="text-sm text-text-muted">Not provided</span>
          )
      ),
    },
    {
      id: "actions",
      header: "",
      showInColumnVisualizer: false,
      pinnable: false,
      headerClassName: "w-10",
      className: "w-10",
      cell: (doctor) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${doctor.fullName}`}
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(doctor)}>
              <Pencil /> Edit doctor
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!doctor.isActive}
              onClick={() => onRevokePortalAccess(doctor)}
            >
              <ShieldOff /> Deactivate doctor
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(doctor)}
            >
              <Trash2 /> Delete doctor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={doctors}
      persistenceKey="doctor-list"
      description={description}
      getRowId={(doctor) => doctor.id}
      loading={loading}
      title={title}
    />
  );
}
