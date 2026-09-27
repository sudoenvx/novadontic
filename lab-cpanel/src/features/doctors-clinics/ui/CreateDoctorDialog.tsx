import type { Clinic } from '../domain/clinic'
import { DoctorFormDialog, type DoctorFormValues } from './DoctorFormDialog'

export type NewDoctor = DoctorFormValues

type CreateDoctorDialogProps = {
  clinics: Clinic[]
  initialClinicId: string
  onCreate: (doctor: NewDoctor) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function CreateDoctorDialog({
  clinics,
  initialClinicId,
  onCreate,
  onOpenChange,
  open,
}: CreateDoctorDialogProps) {
  return (
    <DoctorFormDialog
      clinics={clinics}
      initialClinicId={initialClinicId}
      mode="create"
      onOpenChange={onOpenChange}
      onSubmit={onCreate}
      open={open}
    />
  )
}
