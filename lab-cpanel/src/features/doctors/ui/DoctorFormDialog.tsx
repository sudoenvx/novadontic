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
import type { ClinicOption } from '../../clinics/domain/clinic'
import type { Doctor, DoctorInput, DoctorSource } from '../domain/doctor'

type DoctorFormValues = {
  fullName: string
  specialty: string
  email: string
  address: string
  country: string
  phone: string
  isActive: boolean
  source: DoctorSource
  clinicIds: string[]
}

type DoctorFormDialogProps = {
  clinics: ClinicOption[]
  doctor?: Doctor
  initialClinicId?: string
  mode: 'create' | 'edit'
  onOpenChange: (open: boolean) => void
  onSubmit: (values: DoctorInput) => void
  open: boolean
  isPending?: boolean
}

export function DoctorFormDialog({
  clinics,
  doctor,
  initialClinicId = '',
  mode,
  onOpenChange,
  onSubmit,
  open,
  isPending = false,
}: DoctorFormDialogProps) {
  const [values, setValues] = useState(() =>
    getInitialValues(doctor, initialClinicId),
  )
  const [error, setError] = useState('')

  function updateValue<Key extends keyof DoctorFormValues>(
    key: Key,
    value: DoctorFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function handleOpenChange(nextOpen: boolean) {
    setValues(getInitialValues(doctor, initialClinicId))
    setError('')
    onOpenChange(nextOpen)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fullName = values.fullName.trim()
    if (!fullName) {
      setError('Enter the doctor’s full name.')
      return
    }

    onSubmit({
      fullName,
      specialty: values.specialty.trim() || null,
      email: values.email.trim() || null,
      address: values.address.trim() || null,
      country: values.country.trim() || null,
      phone: values.phone.trim() || null,
      isActive: values.isActive,
      source: values.source,
      clinicIds: values.source === 'clinic' ? values.clinicIds : [],
    })
  }

  const isEditing = mode === 'edit'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit doctor profile' : 'Add doctor'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the doctor profile and clinic association.'
                : 'Add a doctor from a clinic or the website portal.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field htmlFor="doctor-name" label="Doctor name">
              <Input
                id="doctor-name"
                value={values.fullName}
                onChange={(event) =>
                  updateValue('fullName', event.currentTarget.value)
                }
                placeholder="e.g. Dr. Omar Khaled"
                autoFocus
              />
            </Field>
            <Field htmlFor="doctor-specialty" label="Specialty">
              <Input
                id="doctor-specialty"
                value={values.specialty}
                onChange={(event) =>
                  updateValue('specialty', event.currentTarget.value)
                }
                placeholder="e.g. Orthodontics"
              />
            </Field>
            <Field htmlFor="doctor-email" label="Email">
              <Input
                id="doctor-email"
                type="email"
                value={values.email}
                onChange={(event) =>
                  updateValue('email', event.currentTarget.value)
                }
                placeholder="doctor@clinic.eg"
              />
            </Field>
            <Field htmlFor="doctor-phone" label="Phone number">
              <Input
                id="doctor-phone"
                type="tel"
                value={values.phone}
                onChange={(event) =>
                  updateValue('phone', event.currentTarget.value)
                }
                placeholder="+20 ..."
              />
            </Field>
            <Field className="sm:col-span-2" htmlFor="doctor-address" label="Address">
              <Input
                id="doctor-address"
                value={values.address}
                onChange={(event) =>
                  updateValue('address', event.currentTarget.value)
                }
                placeholder="Street, city"
              />
            </Field>
            <Field htmlFor="doctor-country" label="Country">
              <Input
                id="doctor-country"
                value={values.country}
                onChange={(event) =>
                  updateValue('country', event.currentTarget.value)
                }
                placeholder="Egypt"
              />
            </Field>
            <Field htmlFor="doctor-source" label="Added via">
              <Select
                value={values.source}
                onValueChange={(value) => {
                  if (value !== 'clinic' && value !== 'portal') return
                  updateValue('source', value)
                  if (value === 'portal') updateValue('clinicIds', [])
                }}
              >
                <SelectTrigger id="doctor-source" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="portal">Website / portal</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {values.source === 'clinic' && (
              <fieldset className="grid gap-1.5">
                <legend className="text-sm font-medium text-text">
                  Clinics (optional)
                </legend>
                <div
                  id="doctor-clinics"
                  role="group"
                  aria-label="Clinics"
                  className="grid max-h-32 gap-2 overflow-y-auto rounded-md border border-border-soft p-2"
                >
                  {clinics.length > 0 ? clinics.map((clinic) => (
                    <label key={clinic.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={values.clinicIds.includes(clinic.id)}
                        onCheckedChange={(checked) => {
                          const clinicIds = checked
                            ? [...values.clinicIds, clinic.id]
                            : values.clinicIds.filter((clinicId) => clinicId !== clinic.id)
                          updateValue('clinicIds', clinicIds)
                        }}
                        aria-label={`Assign ${clinic.name}`}
                      />
                      {clinic.name}
                    </label>
                  )) : (
                    <p className="text-sm text-text-muted">No clinics available.</p>
                  )}
                </div>
              </fieldset>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-text">
            <Checkbox
              checked={values.isActive}
              onCheckedChange={(checked) =>
                updateValue('isActive', checked === true)
              }
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
            <Button
              type="button"
              variant="neutral"
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Saving…'
                : isEditing
                  ? 'Save changes'
                  : 'Add doctor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getInitialValues(
  doctor: Doctor | undefined,
  initialClinicId: string,
): DoctorFormValues {
  return {
    fullName: doctor?.fullName ?? '',
    specialty: doctor?.specialty ?? '',
    email: doctor?.email ?? '',
    address: doctor?.address ?? '',
    country: doctor?.country ?? '',
    phone: doctor?.phone ?? '',
    isActive: doctor?.isActive ?? true,
    source: doctor?.source ?? (initialClinicId ? 'clinic' : 'portal'),
    clinicIds: doctor?.clinics.map((clinic) => clinic.id) ??
      (initialClinicId ? [initialClinicId] : []),
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
