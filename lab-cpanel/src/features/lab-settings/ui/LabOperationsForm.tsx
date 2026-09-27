import { type FormEvent } from 'react'

import { Button } from '../../../shared/ui/Button'
import { SwitchCard } from '../../../shared/ui/SwitchCard'
import type { LabSettings } from '../domain/labSettings'

type LabOperationsFormProps = {
  settings: LabSettings
  onChange: (changes: Partial<LabSettings>) => void
  onSave: () => void
}

export function LabOperationsForm({ settings, onChange, onSave }: LabOperationsFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave()
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <SwitchCard title="Allow clinic portal access" description="Let connected clinics submit cases and follow progress." checked={settings.allowClinicPortal} onCheckedChange={(allowClinicPortal) => onChange({ allowClinicPortal })} />
        <SwitchCard title="Require case approval" description="Hold newly submitted cases until a lab member approves them." checked={settings.requireCaseApproval} onCheckedChange={(requireCaseApproval) => onChange({ requireCaseApproval })} />
      </div>
      <div className="flex justify-end">
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  )
}
