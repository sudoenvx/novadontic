import type { ClinicOption } from '../../clinics/domain/clinic'
import type { DoctorInput } from '../domain/doctor'
import { DoctorFormDialog } from './DoctorFormDialog'

export type NewDoctor = DoctorInput

export function CreateDoctorDialog({
  clinics,
  initialClinicId = '',
  onCreate,
  onOpenChange,
  open,
  isPending,
}: {
  clinics: ClinicOption[]
  initialClinicId?: string
  onCreate: (doctor: NewDoctor) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  isPending?: boolean
}) {
  return (
    <DoctorFormDialog
      clinics={clinics}
      initialClinicId={initialClinicId}
      mode="create"
      onOpenChange={onOpenChange}
      onSubmit={onCreate}
      open={open}
      isPending={isPending}
    />
  )
}
