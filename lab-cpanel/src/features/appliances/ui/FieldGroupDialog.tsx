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

type FieldGroupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string) => void
  isNameAvailable: (name: string) => boolean
}

export function FieldGroupDialog({ open, onOpenChange, onCreate, isNameAvailable }: FieldGroupDialogProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setName('')
      setError('')
    }
    onOpenChange(nextOpen)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Enter a group name.')
      return
    }
    if (!isNameAvailable(name)) {
      setError('A group with this name already exists.')
      return
    }
    onCreate(name.trim())
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add field group</DialogTitle>
          <DialogDescription>Keep related prescription and clinical fields together for a faster case workflow.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <Label htmlFor="field-group-name">Group name</Label>
            <Input id="field-group-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Clinical details" autoFocus />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="neutral" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add group</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
