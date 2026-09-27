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
import type { Appliance } from '../domain/appliance'

type CreateApplianceTypeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (appliance: Appliance) => void
  isNameAvailable: (name: string) => boolean
}

function createId(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `appliance-${Date.now()}`
}

export function CreateApplianceTypeDialog({
  open,
  onOpenChange,
  onCreate,
  isNameAvailable,
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    onCreate({
      id: createId(normalizedName),
      name: normalizedName,
      source: 'Custom type',
      isActive: true,
      casesUsing: 0,
      groups: [],
    })
    handleOpenChange(false)
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
            <Button type="submit">Create appliance</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
