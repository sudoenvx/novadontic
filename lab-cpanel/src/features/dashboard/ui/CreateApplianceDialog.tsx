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
import { isApplianceNameAvailable } from '../domain/appliance'

export type NewAppliance = {
  name: string
  color: string
}

type CreateApplianceDialogProps = {
  existingAppliances: Appliance[]
  onCreate: (appliance: NewAppliance) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

const DEFAULT_APPLIANCE_COLOR = '#5462b7'

export function CreateApplianceDialog({
  existingAppliances,
  onCreate,
  onOpenChange,
  open,
}: CreateApplianceDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(DEFAULT_APPLIANCE_COLOR)
  const [error, setError] = useState('')

  function resetForm() {
    setName('')
    setColor(DEFAULT_APPLIANCE_COLOR)
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

    if (!normalizedName) {
      setError('Enter an appliance name.')
      return
    }

    if (!isApplianceNameAvailable(existingAppliances, normalizedName)) {
      setError('An appliance with this name already exists.')
      return
    }

    onCreate({ name: normalizedName, color })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add appliance</DialogTitle>
            <DialogDescription>
              Create a custom appliance filter for your production cases.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <Label htmlFor="appliance-name">Name</Label>
            <Input
              id="appliance-name"
              value={name}
              onChange={(event) => {
                setName(event.currentTarget.value)
                setError('')
              }}
              placeholder="e.g. Night guard"
              aria-invalid={Boolean(error)}
              autoFocus
            />
            {error && (
              <p className="text-xs text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="appliance-color">Color</Label>
            <Input
              id="appliance-color"
              type="color"
              value={color}
              onChange={(event) => setColor(event.currentTarget.value)}
              className="h-9 cursor-pointer p-1"
              aria-label="Appliance color"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="neutral"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create appliance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
