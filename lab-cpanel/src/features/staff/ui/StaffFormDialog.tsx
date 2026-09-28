import { useState, type FormEvent } from 'react'

import { Button } from '../../../shared/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../shared/ui/Dialog'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/Select'
import type { Staff } from '../domain/staff'
import type { Role } from '../../roles-permissions/domain/role'

export type StaffFormValues = {
  name: string
  email: string
  roleId: string
}

type StaffFormDialogProps = {
  mode: 'create' | 'edit'
  open: boolean
  staff?: Staff
  roles: Role[]
  onOpenChange: (open: boolean) => void
  onSubmit: (values: StaffFormValues) => void
}

export function StaffFormDialog({ mode, onOpenChange, onSubmit, open, roles, staff }: StaffFormDialogProps) {
  const [values, setValues] = useState<StaffFormValues>(() => getInitialValues(staff))
  const [error, setError] = useState('')

  function updateValue<Key extends keyof StaffFormValues>(key: Key, value: StaffFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setValues(getInitialValues(staff))
      setError('')
    }
    onOpenChange(nextOpen)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = { ...values, name: values.name.trim(), email: values.email.trim() }
    if (!normalized.name || !normalized.email) {
      setError('Enter the staff member name and email.')
      return
    }
    onSubmit(normalized)
    handleOpenChange(false)
  }

  const isEditing = mode === 'edit'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit staff member' : 'Add staff member'}</DialogTitle>
            <DialogDescription>{isEditing ? 'Update workspace access and role.' : 'Create a staff member and assign their workspace role.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Field htmlFor="staff-name" label="Full name"><Input id="staff-name" value={values.name} onChange={(event) => updateValue('name', event.currentTarget.value)} placeholder="e.g. Mina Samir" autoFocus /></Field>
            <Field htmlFor="staff-email" label="Email"><Input id="staff-email" type="email" value={values.email} onChange={(event) => updateValue('email', event.currentTarget.value)} placeholder="staff@novadontic.com" /></Field>
            <Field htmlFor="staff-role" label="Role"><Select items={roles.filter((role) => role.type !== 'owner').map((role) => ({ value: role.id, label: role.name }))} value={values.roleId} onValueChange={(value) => updateValue('roleId', value ?? 'technician')}><SelectTrigger id="staff-role" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{roles.filter((role) => role.type !== 'owner').map((role) => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}</SelectContent></Select></Field>
          </div>
          {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
          <DialogFooter><Button type="button" variant="neutral" onClick={() => handleOpenChange(false)}>Cancel</Button><Button type="submit">{isEditing ? 'Save changes' : 'Add staff member'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getInitialValues(staff?: Staff): StaffFormValues {
  return {
    name: staff?.name ?? '',
    email: staff?.email ?? '',
    roleId: staff?.roleId === 'owner' ? 'administrator' : staff?.roleId ?? 'technician',
  }
}

function Field({ children, htmlFor, label }: { children: React.ReactNode; htmlFor: string; label: string }) {
  return <div className="grid gap-1.5"><Label htmlFor={htmlFor}>{label}</Label>{children}</div>
}
