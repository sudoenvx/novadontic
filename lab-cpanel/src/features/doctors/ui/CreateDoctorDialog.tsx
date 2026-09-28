import type { Clinic } from '../../clinics/domain/clinic'
import { DoctorFormDialog, type DoctorFormValues } from './DoctorFormDialog'

export type NewDoctor = DoctorFormValues

export function CreateDoctorDialog({ clinics, initialClinicId = '', onCreate, onOpenChange, open }: { clinics: Clinic[]; initialClinicId?: string; onCreate: (doctor: NewDoctor) => void; onOpenChange: (open: boolean) => void; open: boolean }) {
  return <DoctorFormDialog clinics={clinics} initialClinicId={initialClinicId} mode="create" onOpenChange={onOpenChange} onSubmit={onCreate} open={open} />
}
