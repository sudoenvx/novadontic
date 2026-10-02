import { useState, type FormEvent } from 'react'

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
import type { ApplianceTypeInput } from '../domain/appliance'
import { getApiErrorMessage } from '../../../shared/api/apiError'

type CreateApplianceTypeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (input: ApplianceTypeInput) => Promise<void>
  isNameAvailable: (name: string) => boolean
  isPending?: boolean
}

export function CreateApplianceTypeDialog({
  open,
  onOpenChange,
  onCreate,
  isNameAvailable,
  isPending = false,
}: CreateApplianceTypeDialogProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setName('')
      setError('')
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedName = name.trim()

    if (!normalizedName) {
      setError('Enter an appliance name.')
      return
    }
    if (!isNameAvailable(normalizedName)) {
      setError('An appliance with this name already exists.')
      return
    }

    try {
      await onCreate({ name: normalizedName })
      handleOpenChange(false)
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Could not create appliance type.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add appliance type</DialogTitle>
          <DialogDescription>Create a custom appliance type, then define its field groups and fields.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <Label htmlFor="appliance-name">Name</Label>
            <Input id="appliance-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Night guard" autoFocus />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="neutral" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating…' : 'Create appliance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
