import { useState, type FormEvent, type ReactNode } from 'react'

import { Button } from '../../../shared/ui/Button'
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

export function CreateClinicDialog({
  existingNames,
  onCreate,
  onOpenChange,
  open,
}: CreateClinicDialogProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function resetForm() {
    setName('')
    setAddress('')
    setPhone('')
    setEmail('')
    setError('')
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)

    if (!nextOpen) {
      resetForm()
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedName = name.trim()

    if (!normalizedName || !address.trim() || !phone.trim() || !email.trim()) {
      setError('Complete all clinic details.')
      return
    }

    const nameAlreadyExists = existingNames.some(
      (existingName) => existingName.toLowerCase() === normalizedName.toLowerCase(),
    )

    if (nameAlreadyExists) {
      setError('A clinic with this name already exists.')
      return
    }

    onCreate({
      name: normalizedName,
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add clinic</DialogTitle>
            <DialogDescription>
              Add a clinic to organize its doctors and production activity.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Clinic name" htmlFor="clinic-name" className="sm:col-span-2">
              <Input
                id="clinic-name"
                value={name}
                onChange={(event) => {
                  setName(event.currentTarget.value)
                  setError('')
                }}
                placeholder="e.g. Nile Orthodontics"
                autoFocus
              />
            </Field>
            <Field label="Address" htmlFor="clinic-address" className="sm:col-span-2">
              <Input
                id="clinic-address"
                value={address}
                onChange={(event) => setAddress(event.currentTarget.value)}
                placeholder="Street, city"
              />
            </Field>
            <Field label="Phone" htmlFor="clinic-phone">
              <Input
                id="clinic-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.currentTarget.value)}
                placeholder="+20 ..."
              />
            </Field>
            <Field label="Email" htmlFor="clinic-email">
              <Input
                id="clinic-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                placeholder="hello@clinic.eg"
              />
            </Field>
          </div>

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="neutral" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create clinic
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
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
