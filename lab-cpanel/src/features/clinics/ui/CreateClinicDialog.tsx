import { useState, type FormEvent, type ReactNode } from 'react'

import { Button } from '../../../shared/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../shared/ui/Dialog'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'

export type NewClinic = {
  name: string
  address: string
  phone: string
  email: string
}

type CreateClinicDialogProps = {
  existingNames: string[]
  onCreate: (clinic: NewClinic) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function CreateClinicDialog({ existingNames, onCreate, onOpenChange, open }: CreateClinicDialogProps) {
  const [values, setValues] = useState<NewClinic>({ name: '', address: '', phone: '', email: '' })
  const [error, setError] = useState('')

  function reset() {
    setValues({ name: '', address: '', phone: '', email: '' })
    setError('')
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (!nextOpen) reset()
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const clinic = { name: values.name.trim(), address: values.address.trim(), phone: values.phone.trim(), email: values.email.trim() }
    if (!clinic.name || !clinic.address || !clinic.phone || !clinic.email) {
      setError('Complete all clinic details.')
      return
    }
    if (existingNames.some((name) => name.toLowerCase() === clinic.name.toLowerCase())) {
      setError('A clinic with this name already exists.')
      return
    }
    onCreate(clinic)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader><DialogTitle>Add clinic</DialogTitle><DialogDescription>Add a clinic to organize its doctors and production activity.</DialogDescription></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field className="sm:col-span-2" htmlFor="new-clinic-name" label="Clinic name"><Input id="new-clinic-name" value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.currentTarget.value }))} autoFocus placeholder="e.g. Nile Orthodontics" /></Field>
            <Field className="sm:col-span-2" htmlFor="new-clinic-address" label="Address"><Input id="new-clinic-address" value={values.address} onChange={(event) => setValues((current) => ({ ...current, address: event.currentTarget.value }))} placeholder="Street, city" /></Field>
            <Field htmlFor="new-clinic-phone" label="Phone"><Input id="new-clinic-phone" type="tel" value={values.phone} onChange={(event) => setValues((current) => ({ ...current, phone: event.currentTarget.value }))} placeholder="+20 ..." /></Field>
            <Field htmlFor="new-clinic-email" label="Email"><Input id="new-clinic-email" type="email" value={values.email} onChange={(event) => setValues((current) => ({ ...current, email: event.currentTarget.value }))} placeholder="hello@clinic.eg" /></Field>
          </div>
          {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
          <DialogFooter><Button type="button" variant="neutral" onClick={() => handleOpenChange(false)}>Cancel</Button><Button type="submit">Create clinic</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ children, className, htmlFor, label }: { children: ReactNode; className?: string; htmlFor: string; label: string }) {
  return <div className={className}><div className="grid gap-1.5"><Label htmlFor={htmlFor}>{label}</Label>{children}</div></div>
}
