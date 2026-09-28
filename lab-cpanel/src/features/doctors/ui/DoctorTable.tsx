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
import { PersonAvatar } from "./PersonAvatar";

type DoctorTableProps = {
  doctors: Doctor[];
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
      sortValue: (doctor) => doctor.name,
      cell: (doctor) => (
        <button
          type="button"
          className="flex items-center gap-2 text-left"
          onClick={() => onView(doctor)}
        >
          <PersonAvatar name={doctor.name} size="sm" />
          <span>
            <span className="block truncate font-semibold text-text">
              {doctor.name}
            </span>
            <span className="block truncate text-xs text-text-muted">
              {doctor.specialty}
            </span>
          </span>
        </button>
      ),
    },
    {
      id: "source",
      header: "Added via",
      sortValue: (doctor) => doctor.source,
      cell: (doctor) => (
        <span className="text-sm text-secondary">
          {doctor.source === "portal"
            ? "Website / portal"
            : (getClinicName(doctor) ?? "No clinic assigned")}
        </span>
      ),
    },
    {
      id: "status",
      header: "Portal access",
      cell: (doctor) => <DoctorPortalStatusBadge status={doctor.status} />,
    },
    {
      id: "active-cases",
      header: "Active cases",
      accessorKey: "activeCases",
      cell: (doctor) => (
        <span className="text-sm text-secondary">
          <strong className="text-text">{doctor.activeCases}</strong>{" "}
          {doctor.activeCases === 1 ? "case" : "cases"}
        </span>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
      cell: (doctor) => (
        <a
          href={`mailto:${doctor.email}`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Mail size={13} /> {doctor.email}
        </a>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      accessorKey: "phoneNumber",
      cell: (doctor) => (
        <a
          href={`tel:${doctor.phoneNumber}`}
          className="text-sm text-primary hover:underline"
        >
          {doctor.phoneNumber}
        </a>
      ),
    },
    {
      id: "actions",
      header: "",
      headerClassName: "w-10",
      className: "w-10",
      cell: (doctor) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${doctor.name}`}
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
              disabled={doctor.status === "inactive"}
              onClick={() => onRevokePortalAccess(doctor)}
            >
              <ShieldOff /> Revoke portal access
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
      description={description}
      getRowId={(doctor) => doctor.id}
      title={title}
    />
  );
}
