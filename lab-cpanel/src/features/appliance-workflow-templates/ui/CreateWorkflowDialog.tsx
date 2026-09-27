import { useState, type FormEvent } from 'react'

import { Button } from '../../../shared/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../shared/ui/Dialog'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import { Switch } from '../../../shared/ui/Switch'

type CreateWorkflowDialogProps = {
  open: boolean
  applianceName: string
  onOpenChange: (open: boolean) => void
  onCreate: (name: string, isDefault: boolean) => void
}

export function CreateWorkflowDialog({ open, applianceName, onOpenChange, onCreate }: CreateWorkflowDialogProps) {
  const [name, setName] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [error, setError] = useState('')

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setName('')
      setIsDefault(false)
      setError('')
    }
    onOpenChange(nextOpen)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Enter a workflow name.')
      return
    }
    onCreate(name.trim(), isDefault)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add workflow template</DialogTitle>
          <DialogDescription>Create a reusable production flow for {applianceName}.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <Label htmlFor="workflow-name">Workflow name</Label>
            <Input id="workflow-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Rush production flow" autoFocus />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-text">
            <Switch checked={isDefault} onCheckedChange={setIsDefault} aria-label="Make workflow default" />
            Use as default workflow for this appliance
          </label>
          {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="neutral" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create workflow</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
