import { useState, type FormEvent } from 'react'

import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/Select'
import { Switch } from '../../../shared/ui/Switch'
import { Textarea } from '../../../shared/ui/Textarea'
import {
  isApplianceFieldKeyAvailable,
  type Appliance,
  type ApplianceField,
  type ApplianceFieldType,
} from '../domain/appliance'

type ApplianceFieldFormCardProps = {
  appliance: Appliance
  initialGroupId: string
  field?: ApplianceField
  onSave: (groupId: string, field: ApplianceField) => void
  onCancel: () => void
}

const fieldTypes: { value: ApplianceFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi select' },
  { value: 'textarea', label: 'Long text' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'file', label: 'File' },
  { value: 'image', label: 'Image' },
]

export function ApplianceFieldFormCard({
  appliance,
  initialGroupId,
  field,
  onSave,
  onCancel,
}: ApplianceFieldFormCardProps) {
  const [label, setLabel] = useState(field?.label ?? '')
  const [key, setKey] = useState(field?.key ?? '')
  const [helpText, setHelpText] = useState(field?.helpText ?? '')
  const [type, setType] = useState<ApplianceFieldType>(field?.type ?? 'text')
  const [required, setRequired] = useState(field?.required ?? false)
  const [defaultValue, setDefaultValue] = useState(field?.defaultValue ?? '')
  const [options, setOptions] = useState(field?.options ?? [])
  const [newOption, setNewOption] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_')

    if (!label.trim() || !normalizedKey) {
      setError('Label and field key are required.')
      return
    }
    if (!isApplianceFieldKeyAvailable(appliance, normalizedKey, field?.id)) {
      setError('This field key is already used in the appliance.')
      return
    }

    onSave(initialGroupId, {
      id: field?.id ?? `${normalizedKey}-${Date.now()}`,
      label: label.trim(),
      key: normalizedKey,
      type,
      required,
      helpText: helpText.trim() || undefined,
      defaultValue: defaultValue.trim() || undefined,
      dependsOn: null,
      dependsOnValue: null,
      options: type === 'select' || type === 'multiselect' ? options : [],
    })
  }

  return (
    <Card className="gap-4 bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{field ? 'Edit field' : 'New field'}</p>
          <h2 className="mt-1 text-base font-semibold text-text">{field ? `Update ${field.label}` : 'Add a field to your workflow'}</h2>
          <p className="mt-1 text-sm text-text-muted">Control how staff see and complete this field when creating a case.</p>
        </div>
        <Button type="button" variant="neutral" onClick={onCancel}>Cancel</Button>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Label" htmlFor="field-label">
            <Input id="field-label" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="e.g. Wear schedule" autoFocus />
          </Field>
          <Field label="Field key" htmlFor="field-key" hint="Used in API and case data">
            <Input id="field-key" value={key} onChange={(event) => setKey(event.target.value)} placeholder="wear_schedule" />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Field type">
            <Select
              items={Object.fromEntries(fieldTypes.map((fieldType) => [fieldType.value, fieldType.label]))}
              value={type}
              onValueChange={(value) => setType((value ?? 'text') as ApplianceFieldType)}
            >
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{fieldTypes.map((fieldType) => <SelectItem key={fieldType.value} value={fieldType.value}>{fieldType.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Help text" htmlFor="field-help" hint="Shown to staff filling the case">
          <Textarea id="field-help" value={helpText} onChange={(event) => setHelpText(event.target.value)} placeholder="Explain what this value is used for" />
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Default value" htmlFor="field-default">
            <Input id="field-default" value={defaultValue} onChange={(event) => setDefaultValue(event.target.value)} placeholder="Optional" />
          </Field>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm font-medium text-text">
              <Switch checked={required} onCheckedChange={setRequired} aria-label="Required field" />
              Required field
            </label>
          </div>
        </div>

        {(type === 'select' || type === 'multiselect') && (
          <Field label="Options" hint="Add the choices staff can select.">
            <div className="grid gap-2">
              {options.map((option, index) => (
                <div key={`${option.value}-${index}`} className="flex items-center gap-2">
                  <Input value={option.label} aria-label={`Option ${index + 1}`} onChange={(event) => setOptions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value, value: event.target.value.trim().toLowerCase().replace(/\s+/g, '_') } : item))} placeholder="Option label" />
                  <Button type="button" size="icon-sm" variant="neutral" aria-label={`Remove option ${index + 1}`} onClick={() => setOptions((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input value={newOption} onChange={(event) => setNewOption(event.target.value)} placeholder="Add an option" onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addOption() } }} />
                <Button type="button" variant="neutral" onClick={addOption}>Add option</Button>
              </div>
            </div>
          </Field>
        )}

        {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="neutral" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{field ? 'Save changes' : 'Save field'}</Button>
        </div>
      </form>
    </Card>
  )

  function addOption() {
    const label = newOption.trim()
    if (!label) return
    setOptions((current) => [...current, { label, value: label.toLowerCase().replace(/\s+/g, '_') }])
    setNewOption('')
  }
}

function Field({ children, hint, htmlFor, label }: { children: React.ReactNode; hint?: string; htmlFor?: string; label: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <span className="text-2xs text-text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  )
}
