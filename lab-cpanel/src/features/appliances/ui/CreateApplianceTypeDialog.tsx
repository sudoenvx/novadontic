import { useState } from 'react'

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
  const [icon, setIcon] = useState('🦷')
  const [color, setColor] = useState('#e4eefb')
  const [error, setError] = useState('')

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setName('')
      setIcon('🦷')
      setColor('#e4eefb')
      setError('')
    }
    onOpenChange(nextOpen)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Enter an appliance name.')
      return
    }
    if (!isNameAvailable(name)) {
      setError('An appliance with this name already exists.')
      return
    }

    onCreate({
      id: createId(name),
      name: name.trim(),
      icon: icon.trim() || '🦷',
      color,
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
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="appliance-icon">Icon</Label>
              <Input id="appliance-icon" value={icon} onChange={(event) => setIcon(event.target.value)} maxLength={4} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="appliance-color">Color</Label>
              <Input id="appliance-color" type="color" value={color} onChange={(event) => setColor(event.target.value)} className="w-12 p-1" />
            </div>
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
