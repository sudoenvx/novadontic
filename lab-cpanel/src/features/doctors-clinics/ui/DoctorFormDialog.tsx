import { useState, type FormEvent, type ReactNode } from 'react'

import { Button } from '../../../shared/ui/Button'
import { Checkbox } from '../../../shared/ui/Checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/Dialog'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/Select'
import type { Clinic } from '../domain/clinic'
import type { Doctor, DoctorSource } from '../domain/doctor'

const NO_CLINIC = '__no_clinic__'

export type DoctorFormValues = {
  name: string
  specialty: string
  email: string
  address: string
  country: string
  phoneNumber: string
  isActive: boolean
  source: DoctorSource
  clinicId?: string
}

type DoctorFormDialogProps = {
  clinics: Clinic[]
  doctor?: Doctor
  initialClinicId?: string
  mode: 'create' | 'edit'
  onOpenChange: (open: boolean) => void
  onSubmit: (values: DoctorFormValues) => void
  open: boolean
}

export function DoctorFormDialog({
  clinics,
  doctor,
  initialClinicId = '',
  mode,
  onOpenChange,
  onSubmit,
  open,
}: DoctorFormDialogProps) {
  const [values, setValues] = useState<DoctorFormValues>(() => getInitialValues(doctor, initialClinicId))
  const [error, setError] = useState('')

  function updateValue<Key extends keyof DoctorFormValues>(
    key: Key,
    value: DoctorFormValues[Key],
  ) {
    setValues((currentValues) => ({ ...currentValues, [key]: value }))
    setError('')
  }

  function handleOpenChange(nextOpen: boolean) {
    setValues(getInitialValues(doctor, initialClinicId))
    onOpenChange(nextOpen)
    setError('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedValues: DoctorFormValues = {
      ...values,
      name: values.name.trim(),
      specialty: values.specialty.trim(),
      email: values.email.trim(),
      address: values.address.trim(),
      country: values.country.trim(),
      phoneNumber: values.phoneNumber.trim(),
      source: values.source,
      clinicId: values.source === 'clinic' ? values.clinicId || undefined : undefined,
    }

    if (
      !normalizedValues.name ||
      !normalizedValues.specialty ||
      !normalizedValues.email ||
      !normalizedValues.address ||
      !normalizedValues.country ||
      !normalizedValues.phoneNumber
    ) {
      setError('Complete all doctor details.')
      return
    }

    onSubmit(normalizedValues)
    handleOpenChange(false)
  }

  const isEditing = mode === 'edit'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit doctor profile' : 'Add doctor'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the doctor profile and clinic access.'
                : 'Invite a doctor from a clinic or through your clinic portal.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Doctor name" htmlFor="doctor-name">
              <Input
                id="doctor-name"
                value={values.name}
                onChange={(event) => updateValue('name', event.currentTarget.value)}
                placeholder="e.g. Dr. Omar Khaled"
                autoFocus
              />
            </Field>
            <Field label="Specialty" htmlFor="doctor-specialty">
              <Input
                id="doctor-specialty"
                value={values.specialty}
                onChange={(event) => updateValue('specialty', event.currentTarget.value)}
                placeholder="e.g. Orthodontics"
              />
            </Field>
            <Field label="Email" htmlFor="doctor-email">
              <Input
                id="doctor-email"
                type="email"
                value={values.email}
                onChange={(event) => updateValue('email', event.currentTarget.value)}
                placeholder="doctor@clinic.eg"
              />
            </Field>
            <Field label="Phone number" htmlFor="doctor-phone">
              <Input
                id="doctor-phone"
                type="tel"
                value={values.phoneNumber}
                onChange={(event) => updateValue('phoneNumber', event.currentTarget.value)}
                placeholder="+20 ..."
              />
              <p className="text-xs text-text-muted">The number of parcels updates automatically.</p>
            </Field>
            <Field label="Address" htmlFor="doctor-address" className="sm:col-span-2">
              <Input
                id="doctor-address"
                value={values.address}
                onChange={(event) => updateValue('address', event.currentTarget.value)}
                placeholder="Street, city"
              />
            </Field>
            <Field label="Country" htmlFor="doctor-country">
              <Input
                id="doctor-country"
                value={values.country}
                onChange={(event) => updateValue('country', event.currentTarget.value)}
                placeholder="Egypt"
              />
            </Field>
            <Field label="Added via" htmlFor="doctor-source">
              <Select
                items={{ clinic: 'Clinic', portal: 'Website / portal' }}
                value={values.source}
                onValueChange={(value) => {
                  const source = (value ?? 'clinic') as DoctorSource
                  updateValue('source', source)
                  if (source === 'portal') updateValue('clinicId', undefined)
                }}
              >
                <SelectTrigger id="doctor-source" className="w-full" size="default">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="portal">Website / portal</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {values.source === 'clinic' && (
              <Field label="Clinic (optional)" htmlFor="doctor-clinic">
                <Select
                  items={[{ value: NO_CLINIC, label: 'No clinic assigned' }, ...clinics.map((clinic) => ({ value: clinic.id, label: clinic.name }))]}
                  value={values.clinicId || NO_CLINIC}
                  onValueChange={(value) =>
                    updateValue('clinicId', value === NO_CLINIC ? undefined : value ?? undefined)
                  }
                >
                  <SelectTrigger id="doctor-clinic" className="w-full" size="default">
                    <SelectValue placeholder="No clinic assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CLINIC}>No clinic assigned</SelectItem>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-text">
            <Checkbox
              checked={values.isActive}
              onCheckedChange={(checked) => updateValue('isActive', checked)}
              aria-label="Doctor is active"
            />
            Doctor is active
          </label>

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="neutral" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Save changes' : 'Send invite'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getInitialValues(doctor: Doctor | undefined, initialClinicId: string): DoctorFormValues {
  return {
    name: doctor?.name ?? '',
    specialty: doctor?.specialty ?? '',
    email: doctor?.email ?? '',
    address: doctor?.address ?? '',
    country: doctor?.country ?? '',
    phoneNumber: doctor?.phoneNumber ?? '',
    isActive: doctor?.isActive ?? true,
    source: doctor?.source ?? (doctor?.clinicId || initialClinicId ? 'clinic' : 'portal'),
    clinicId: doctor?.clinicId ?? initialClinicId,
  }
}

function Field({
  children,
  className,
  htmlFor,
  label,
}: {
  children: ReactNode
  className?: string
  htmlFor: string
  label: string
}) {
  return (
    <div className={className}>
      <div className="grid gap-1.5">
        <Label htmlFor={htmlFor}>{label}</Label>
        {children}
      </div>
    </div>
  )
}
