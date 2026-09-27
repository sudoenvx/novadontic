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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/Select'
import { Textarea } from '../../../shared/ui/Textarea'
import {
  isApplianceFieldKeyAvailable,
  parseFieldOptions,
  type Appliance,
  type ApplianceField,
  type ApplianceFieldGroup,
  type ApplianceFieldType,
} from '../domain/appliance'

type ApplianceFieldDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  appliance: Appliance
  groups: ApplianceFieldGroup[]
  initialGroupId?: string
  field?: ApplianceField
  onSave: (groupId: string, field: ApplianceField) => void
}

const fieldTypes: { value: ApplianceFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi select' },
  { value: 'textarea', label: 'Long text' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
]

export function ApplianceFieldDialog({ open, onOpenChange, appliance, groups, initialGroupId, field, onSave }: ApplianceFieldDialogProps) {
  const [label, setLabel] = useState(field?.label ?? '')
  const [key, setKey] = useState(field?.key ?? '')
  const [groupId, setGroupId] = useState(initialGroupId ?? groups[0]?.id ?? '')
  const [helpText, setHelpText] = useState(field?.helpText ?? '')
  const [type, setType] = useState<ApplianceFieldType>(field?.type ?? 'text')
  const [required, setRequired] = useState(field?.required ?? false)
  const [defaultValue, setDefaultValue] = useState(field?.defaultValue ?? '')
  const [dependsOn, setDependsOn] = useState(field?.dependsOn ?? 'none')
  const [dependsOnValue, setDependsOnValue] = useState(field?.dependsOnValue ?? '')
  const [options, setOptions] = useState(field ? serializeOptions(field.options) : '')
  const [error, setError] = useState('')

  function resetForm() {
    setLabel(field?.label ?? '')
    setKey(field?.key ?? '')
    setGroupId(initialGroupId ?? groups[0]?.id ?? '')
    setHelpText(field?.helpText ?? '')
    setType(field?.type ?? 'text')
    setRequired(field?.required ?? false)
    setDefaultValue(field?.defaultValue ?? '')
    setDependsOn(field?.dependsOn ?? 'none')
    setDependsOnValue(field?.dependsOnValue ?? '')
    setOptions(field ? serializeOptions(field.options) : '')
    setError('')
  }

  function handleOpenChange(nextOpen: boolean) {
    resetForm()
    onOpenChange(nextOpen)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_')
    if (!label.trim() || !normalizedKey || !groupId) {
      setError('Label, field key, and group are required.')
      return
    }
    if (!isApplianceFieldKeyAvailable(appliance, normalizedKey, field?.id)) {
      setError('This field key is already used in the appliance.')
      return
    }

    onSave(groupId, {
      id: field?.id ?? `${normalizedKey}-${Date.now()}`,
      label: label.trim(),
      key: normalizedKey,
      type,
      required,
      helpText: helpText.trim() || undefined,
      defaultValue: defaultValue.trim() || undefined,
      dependsOn: dependsOn === 'none' ? undefined : dependsOn,
      dependsOnValue: dependsOn === 'none' ? undefined : dependsOnValue.trim() || undefined,
      options: type === 'select' || type === 'multiselect' ? parseFieldOptions(options) : [],
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{field ? 'Edit field' : 'Add field'}</DialogTitle>
          <DialogDescription>Define how this value appears when staff create a case.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <Label htmlFor="field-label">Label</Label>
            <Input id="field-label" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="e.g. Wear schedule" autoFocus />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="field-key">Field key</Label>
              <Input id="field-key" value={key} onChange={(event) => setKey(event.target.value)} placeholder="wear_schedule" />
            </div>
            <div className="grid gap-1.5">
              <Label>Group</Label>
              <Select value={groupId} onValueChange={(value) => setGroupId(value ?? '')}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Choose a group" /></SelectTrigger>
                <SelectContent>{groups.map((group) => <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="field-help">Help text</Label>
            <Textarea id="field-help" value={helpText} onChange={(event) => setHelpText(event.target.value)} placeholder="Shown to staff filling the case" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Field type</Label>
              <Select value={type} onValueChange={(value) => setType((value ?? 'text') as ApplianceFieldType)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{fieldTypes.map((fieldType) => <SelectItem key={fieldType.value} value={fieldType.value}>{fieldType.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <label className="flex items-end gap-2 pb-1.5 text-xs font-medium">
              <input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} className="size-4 accent-primary" />
              Required field
            </label>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="field-default">Default value</Label>
            <Input id="field-default" value={defaultValue} onChange={(event) => setDefaultValue(event.target.value)} placeholder="Optional" />
          </div>
          <div className="grid gap-1.5">
            <Label>Depends on</Label>
            <Select value={dependsOn} onValueChange={(value) => setDependsOn(value ?? 'none')}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No dependency</SelectItem>
                {appliance.groups.flatMap((group) => group.fields).map((field) => <SelectItem key={field.id} value={field.key}>{field.label} ({field.key})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {dependsOn !== 'none' && (
            <div className="grid gap-1.5">
              <Label htmlFor="field-dependency-value">When value is</Label>
              <Input id="field-dependency-value" value={dependsOnValue} onChange={(event) => setDependsOnValue(event.target.value)} placeholder="e.g. Both" />
            </div>
          )}
          {(type === 'select' || type === 'multiselect') && (
            <div className="grid gap-1.5">
              <Label htmlFor="field-options">Options</Label>
              <Textarea id="field-options" value={options} onChange={(event) => setOptions(event.target.value)} placeholder={'One option per line\nvalue|Label'} />
              <p className="text-2xs text-text-muted">Use one option per line. Add a value before | when it should differ from the label.</p>
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="neutral" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit">{field ? 'Save changes' : 'Save field'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function serializeOptions(options: ApplianceField['options']) {
  return options.map((option) => `${option.value}|${option.label}`).join('\n')
}
