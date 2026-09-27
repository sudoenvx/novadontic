import { type FormEvent } from 'react'

import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/Select'
import type { LabSettings } from '../domain/labSettings'

type LabProfileFormProps = {
  settings: LabSettings
  onChange: (changes: Partial<LabSettings>) => void
  onSave: () => void
}

export function LabProfileForm({ settings, onChange, onSave }: LabProfileFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave()
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Lab name" htmlFor="lab-name">
          <Input id="lab-name" value={settings.labName} onChange={(event) => onChange({ labName: event.target.value })} />
        </Field>
        <Field label="Country">
          <Select value={settings.country} onValueChange={(value) => onChange({ country: value ?? settings.country })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Palestine">Palestine</SelectItem>
              <SelectItem value="Egypt">Egypt</SelectItem>
              <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
              <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Lab email" htmlFor="lab-email">
          <Input id="lab-email" type="email" value={settings.email} onChange={(event) => onChange({ email: event.target.value })} />
        </Field>
        <Field label="Phone number" htmlFor="lab-phone">
          <Input id="lab-phone" type="tel" value={settings.phoneNumber} onChange={(event) => onChange({ phoneNumber: event.target.value })} />
        </Field>
        <Field label="Address" htmlFor="lab-address">
          <Input id="lab-address" value={settings.address} onChange={(event) => onChange({ address: event.target.value })} />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  )
}

function Field({ children, htmlFor, label }: { children: React.ReactNode; htmlFor?: string; label: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}
