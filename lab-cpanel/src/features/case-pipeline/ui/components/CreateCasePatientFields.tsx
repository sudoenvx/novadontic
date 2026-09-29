import { Card, CardHeader, CardTitle } from '../../../../shared/ui/Card'
import { Field, FieldContent, FieldLabel } from '../../../../shared/ui/Field'
import { Input } from '../../../../shared/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../shared/ui/Select'
import { clinicFixtures } from '../../../clinics/data/clinics'
import type { Doctor } from '../../../doctors/domain/doctor'
import type { CreateCaseValueUpdater, CreateCaseValues } from './createCase.types'

const noClinicOption = '__no_clinic__'

type CreateCasePatientFieldsProps = {
  values: CreateCaseValues
  doctors: Doctor[]
  onClinicChange: (clinicId: string) => void
  onUpdateValue: CreateCaseValueUpdater
}

export function CreateCasePatientFields({
  values,
  doctors,
  onClinicChange,
  onUpdateValue,
}: CreateCasePatientFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient &amp; practice</CardTitle>
        <p className="text-sm text-text-muted">
          Identify the patient and the doctor requesting this case.
        </p>
      </CardHeader>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="case-patient-name">
            Patient name <span aria-hidden="true" className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              id="case-patient-name"
              value={values.patientName}
              onChange={(event) => onUpdateValue('patientName', event.currentTarget.value)}
              placeholder="e.g. Yassin Farouk"
              autoFocus
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="case-patient-code">Patient code (optional)</FieldLabel>
          <FieldContent>
            <Input
              id="case-patient-code"
              value={values.patientCode}
              onChange={(event) => onUpdateValue('patientCode', event.currentTarget.value)}
              placeholder="e.g. PT-1040"
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="case-clinic">Clinic (optional)</FieldLabel>
          <FieldContent>
            <Select
              items={[
                { value: noClinicOption, label: 'All clinics / portal' },
                ...clinicFixtures.map((clinic) => ({ value: clinic.id, label: clinic.name })),
              ]}
              value={values.clinicId || noClinicOption}
              onValueChange={(value) => onClinicChange(value === noClinicOption ? '' : (value ?? ''))}
            >
              <SelectTrigger id="case-clinic" className="w-full">
                <SelectValue placeholder="All clinics / portal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={noClinicOption}>All clinics / portal</SelectItem>
                {clinicFixtures.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>{clinic.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="case-doctor">
            Doctor <span aria-hidden="true" className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Select
              items={doctors.map((doctor) => ({ value: doctor.id, label: doctor.name }))}
              value={values.doctorId}
              onValueChange={(value) => onUpdateValue('doctorId', value ?? '')}
            >
              <SelectTrigger id="case-doctor" className="w-full">
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
      </div>
    </Card>
  )
}
