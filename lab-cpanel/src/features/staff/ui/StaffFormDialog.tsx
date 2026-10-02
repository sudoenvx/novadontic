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
import type { Staff, StaffRole } from '../domain/staff'

export type StaffFormValues = {
  fullName: string
  email: string
  password: string
  phone: string
  roleIds: string[]
}

type StaffFormDialogProps = {
  mode: 'create' | 'edit'
  open: boolean
  staff?: Staff
  roles: StaffRole[]
  rolesError?: string
  isPending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: StaffFormValues) => void
}

export function StaffFormDialog({
  mode,
  onOpenChange,
  onSubmit,
  open,
  roles,
  rolesError,
  staff,
  isPending = false,
}: StaffFormDialogProps) {
  const [values, setValues] = useState(() => getInitialValues(staff))
  const [error, setError] = useState('')

  function updateValue<Key extends keyof StaffFormValues>(
    key: Key,
    value: StaffFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isPending) return
    if (!nextOpen) {
      setValues(getInitialValues(staff))
      setError('')
    }
    onOpenChange(nextOpen)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = {
      ...values,
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      password: values.password,
    }

    if (!normalized.fullName || !normalized.email) {
      setError('Enter the staff member name and email.')
      return
    }
    if (!normalized.roleIds.length) {
      setError('Assign at least one role.')
      return
    }
    if (mode === 'create' && normalized.password.length < 12) {
      setError('Set an initial password of at least 12 characters.')
      return
    }

    onSubmit(normalized)
  }

  const isEditing = mode === 'edit'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit staff member' : 'Add staff member'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the user profile and assigned workspace roles.'
                : 'Create a user account and assign its workspace roles.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Field htmlFor="staff-name" label="Full name">
              <Input
                id="staff-name"
                value={values.fullName}
                onChange={(event) => updateValue('fullName', event.currentTarget.value)}
                autoComplete="name"
                autoFocus
              />
            </Field>
            <Field htmlFor="staff-email" label="Email">
              <Input
                id="staff-email"
                type="email"
                value={values.email}
                onChange={(event) => updateValue('email', event.currentTarget.value)}
                autoComplete="email"
              />
            </Field>
            <Field htmlFor="staff-phone" label="Phone (optional)">
              <Input
                id="staff-phone"
                type="tel"
                value={values.phone}
                onChange={(event) => updateValue('phone', event.currentTarget.value)}
                autoComplete="tel"
              />
            </Field>
            {!isEditing && (
              <Field htmlFor="staff-password" label="Initial password">
                <Input
                  id="staff-password"
                  type="password"
                  value={values.password}
                  onChange={(event) => updateValue('password', event.currentTarget.value)}
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={128}
                />
                <p className="text-xs text-text-muted">Must be at least 12 characters.</p>
              </Field>
            )}
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium text-text">Roles</legend>
              {rolesError && (
                <p role="alert" className="text-sm text-destructive">{rolesError}</p>
              )}
              {roles.length > 0 ? roles.map((role) => (
                <label key={role.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={values.roleIds.includes(role.id)}
                    onCheckedChange={(checked) => {
                      const roleIds = checked
                        ? [...values.roleIds, role.id]
                        : values.roleIds.filter((roleId) => roleId !== role.id)
                      updateValue('roleIds', roleIds)
                    }}
                    aria-label={`Assign ${role.name} role`}
                  />
                  {role.name}
                </label>
              )) : !rolesError ? (
                <p className="text-sm text-text-muted">No assignable roles are available.</p>
              ) : null}
            </fieldset>
          </div>
          {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="neutral"
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || roles.length === 0}>
              {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Create account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getInitialValues(staff?: Staff): StaffFormValues {
  return {
    fullName: staff?.fullName ?? '',
    email: staff?.email ?? '',
    password: '',
    phone: staff?.phone ?? '',
    roleIds: staff?.roles.map((role) => role.id) ?? [],
  }
}

function Field({
  children,
  htmlFor,
  label,
}: {
  children: ReactNode
  htmlFor: string
  label: string
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}
