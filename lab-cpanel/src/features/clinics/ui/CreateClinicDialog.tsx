import { useState, type FormEvent, type ReactNode } from 'react'

import { Button } from '../../../shared/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../shared/ui/Dialog'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import { Textarea } from '../../../shared/ui/Textarea'
import type { Clinic, ClinicInput } from '../domain/clinic'

type ClinicFormValues = {
  name: string
  legalName: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  notes: string
}

type CreateClinicDialogProps = {
  clinic?: Clinic
  existingNames: string[]
  isPending?: boolean
  onSubmit: (clinic: ClinicInput) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

function getInitialValues(clinic?: Clinic): ClinicFormValues {
  return {
    name: clinic?.name ?? '',
    legalName: clinic?.legalName ?? '',
    email: clinic?.email ?? '',
    phone: clinic?.phone ?? '',
    website: clinic?.website ?? '',
    address: clinic?.address ?? '',
    city: clinic?.city ?? '',
    notes: clinic?.notes ?? '',
  }
}

export function CreateClinicDialog({
  clinic,
  existingNames,
  isPending = false,
  onSubmit,
  onOpenChange,
  open,
}: CreateClinicDialogProps) {
  const [values, setValues] = useState<ClinicFormValues>(() =>
    getInitialValues(clinic),
  )
  const [error, setError] = useState('')

  function updateValue<K extends keyof ClinicFormValues>(
    key: K,
    value: ClinicFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = values.name.trim()
    if (!name) {
      setError('Clinic name is required.')
      return
    }

    if (
      existingNames.some(
        (existingName) =>
          existingName.toLowerCase() === name.toLowerCase() &&
          existingName !== clinic?.name,
      )
    ) {
      setError('A clinic with this name already exists.')
      return
    }

    const optionalValue = (value: string) => value.trim() || null
    onSubmit({
      name,
      legalName: optionalValue(values.legalName),
      email: optionalValue(values.email),
      phone: optionalValue(values.phone),
      website: optionalValue(values.website),
      address: optionalValue(values.address),
      city: optionalValue(values.city),
      notes: optionalValue(values.notes),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{clinic ? 'Edit clinic' : 'Add clinic'}</DialogTitle>
            <DialogDescription>
              {clinic
                ? 'Update the clinic details used across your lab.'
                : 'Add a clinic to organize its doctors and production activity.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field className="sm:col-span-2" htmlFor="clinic-name" label="Clinic name">
              <Input id="clinic-name" maxLength={150} required value={values.name} onChange={(event) => updateValue('name', event.currentTarget.value)} autoFocus placeholder="e.g. Nile Orthodontics" />
            </Field>
            <Field className="sm:col-span-2" htmlFor="clinic-legal-name" label="Legal name">
              <Input id="clinic-legal-name" maxLength={200} value={values.legalName} onChange={(event) => updateValue('legalName', event.currentTarget.value)} />
            </Field>
            <Field htmlFor="clinic-email" label="Email">
              <Input id="clinic-email" type="email" maxLength={150} value={values.email} onChange={(event) => updateValue('email', event.currentTarget.value)} placeholder="hello@clinic.eg" />
            </Field>
            <Field htmlFor="clinic-phone" label="Phone">
              <Input id="clinic-phone" type="tel" maxLength={30} value={values.phone} onChange={(event) => updateValue('phone', event.currentTarget.value)} placeholder="+20 ..." />
            </Field>
            <Field className="sm:col-span-2" htmlFor="clinic-website" label="Website">
              <Input id="clinic-website" type="url" maxLength={255} value={values.website} onChange={(event) => updateValue('website', event.currentTarget.value)} placeholder="https://clinic.example" />
            </Field>
            <Field className="sm:col-span-2" htmlFor="clinic-address" label="Address">
              <Input id="clinic-address" maxLength={200} value={values.address} onChange={(event) => updateValue('address', event.currentTarget.value)} placeholder="Street address" />
            </Field>
            <Field className="sm:col-span-2" htmlFor="clinic-city" label="City">
              <Input id="clinic-city" maxLength={100} value={values.city} onChange={(event) => updateValue('city', event.currentTarget.value)} />
            </Field>
            <Field className="sm:col-span-2" htmlFor="clinic-notes" label="Notes">
              <Textarea id="clinic-notes" maxLength={10_000} rows={3} value={values.notes} onChange={(event) => updateValue('notes', event.currentTarget.value)} />
            </Field>
          </div>
          {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="neutral" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : clinic ? 'Save changes' : 'Create clinic'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ children, className, htmlFor, label }: { children: ReactNode; className?: string; htmlFor: string; label: string }) {
  return <div className={className}><div className="grid gap-1.5"><Label htmlFor={htmlFor}>{label}</Label>{children}</div></div>
}
