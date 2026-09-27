import { Building2, Globe2, MapPin, Phone, Stethoscope } from "lucide-react";
import type { ReactNode } from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/Card";
import type { Clinic } from "../domain/clinic";
import type { Doctor } from "../domain/doctor";

export function DoctorPracticeDetails({
  clinic,
  doctor,
}: {
  clinic?: Clinic;
  doctor: Doctor;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Practice details</CardTitle>
        <CardDescription>
          Contact and practice information for this doctor.
        </CardDescription>
      </CardHeader>
      <div className="grid gap-2 sm:grid-cols-2">
        <Detail
          icon={<Building2 />}
          label="Clinic"
          value={clinic?.name ?? "No clinic assigned"}
        />
        <Detail
          icon={<Stethoscope />}
          label="Specialty"
          value={doctor.specialty}
        />
        <Detail icon={<MapPin />} label="Address" value={doctor.address} />
        <Detail
          icon={<Phone />}
          label="Clinic phone"
          value={clinic?.phone ?? "Not available"}
        />
        <Detail icon={<Globe2 />} label="Country" value={doctor.country} />
        <Detail
          icon={<Phone />}
          label="Doctor phone"
          value={doctor.phoneNumber}
        />
      </div>
    </Card>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-sm bg-surface-muted/60 px-2 py-2">
      <span className="shrink-0 [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-text">{value}</p>
      </div>
    </div>
  );
}
