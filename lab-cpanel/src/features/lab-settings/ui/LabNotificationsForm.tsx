import { type FormEvent } from 'react'

import { Button } from '../../../shared/ui/Button'
import { SwitchCard } from '../../../shared/ui/SwitchCard'
import type { LabSettings } from '../domain/labSettings'

type LabNotificationsFormProps = {
  settings: LabSettings
  onChange: (changes: Partial<LabSettings>) => void
  onSave: () => void
}

export function LabNotificationsForm({ settings, onChange, onSave }: LabNotificationsFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave()
  }

  return (
    <form className="grid gap-2" onSubmit={handleSubmit}>
      <SwitchCard title="New case submitted" description="Notify lab members when a clinic submits a new case." checked={settings.notifyNewCase} onCheckedChange={(notifyNewCase) => onChange({ notifyNewCase })} />
      <SwitchCard title="Case status changes" description="Notify the assigned clinic when a case moves to another step." checked={settings.notifyStatusChange} onCheckedChange={(notifyStatusChange) => onChange({ notifyStatusChange })} />
      <SwitchCard title="Production delay alerts" description="Alert admins when a case passes its expected completion date." checked={settings.notifyProductionDelay} onCheckedChange={(notifyProductionDelay) => onChange({ notifyProductionDelay })} />
      <SwitchCard title="Daily production summary" description="Receive one daily summary of active cases and upcoming work." checked={settings.notifyDailySummary} onCheckedChange={(notifyDailySummary) => onChange({ notifyDailySummary })} />
      <div className="flex justify-end pt-1">
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  )
}
