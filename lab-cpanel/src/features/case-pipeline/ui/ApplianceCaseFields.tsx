import { useMemo } from 'react'

import { Checkbox } from '../../../shared/ui/Checkbox'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/Select'
import { Textarea } from '../../../shared/ui/Textarea'
import type { Appliance, ApplianceField } from '../../appliances/domain/appliance'
import type { CaseFieldValue } from '../domain/casePipeline'

export type CaseFieldValues = Record<string, CaseFieldValue>

type ApplianceCaseFieldsProps = {
  appliance: Appliance
  values: CaseFieldValues
  onValueChange: (fieldKey: string, value: CaseFieldValue) => void
}

export function ApplianceCaseFields({
  appliance,
  onValueChange,
  values,
}: ApplianceCaseFieldsProps) {
  const fieldCount = useMemo(
    () => appliance.groups.reduce((count, group) => count + group.fields.length, 0),
    [appliance.groups],
  )

  if (fieldCount === 0) {
    return <p className="text-sm text-text-muted">No additional appliance details are required.</p>
  }

  return (
    <div className="grid gap-4">
      {appliance.groups.map((group) => (
        <section key={group.id} className="grid gap-2">
          <h3 className="text-sm font-semibold text-text">{group.name}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.fields.map((field) => (
              <ApplianceCaseField
                key={field.id}
                field={field}
                value={values[field.key]}
                onValueChange={(value) => onValueChange(field.key, value)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function ApplianceCaseField({
  field,
  onValueChange,
  value,
}: {
  field: ApplianceField
  value: CaseFieldValue | undefined
  onValueChange: (value: CaseFieldValue) => void
}) {
  const label = (
    <Label htmlFor={`case-field-${field.key}`}>
      {field.label}
      {field.required && <span className="text-destructive">*</span>}
    </Label>
  )

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-sm text-text sm:col-span-2">
        <Checkbox
          checked={value === true}
          onCheckedChange={(checked) => onValueChange(checked === true)}
          aria-label={field.label}
        />
        {field.label}
      </label>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div className="grid gap-1.5 sm:col-span-2">
        {label}
        <Textarea
          id={`case-field-${field.key}`}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onValueChange(event.currentTarget.value)}
          placeholder={field.helpText ?? `Enter ${field.label.toLowerCase()}`}
        />
      </div>
    )
  }

  if (field.type === 'select' && field.options.length > 0) {
    return (
      <div className="grid gap-1.5">
        {label}
        <Select
          items={field.options.map((option) => ({ value: option.value, label: option.label }))}
          value={typeof value === 'string' ? value : ''}
          onValueChange={(nextValue) => onValueChange(nextValue ?? '')}
        >
          <SelectTrigger id={`case-field-${field.key}`} className="w-full">
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (field.type === 'multiselect' && field.options.length > 0) {
    const selectedValues = Array.isArray(value) ? value : []

    return (
      <fieldset className="grid gap-1.5 sm:col-span-2">
        <legend className="text-xs font-medium text-text">
          {field.label}{field.required && <span className="text-destructive">*</span>}
        </legend>
        <div className="flex flex-wrap gap-2">
          {field.options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 rounded-sm bg-neutral-100 px-2 py-1.5 text-xs text-text">
              <Checkbox
                checked={selectedValues.includes(option.value)}
                onCheckedChange={(checked) => onValueChange(checked === true
                  ? [...selectedValues, option.value]
                  : selectedValues.filter((selectedValue) => selectedValue !== option.value))}
                aria-label={option.label}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  if (field.type === 'file' || field.type === 'image') {
    return (
      <div className="grid gap-1.5">
        {label}
        <Input
          id={`case-field-${field.key}`}
          type="file"
          accept={field.type === 'image' ? 'image/*' : undefined}
          onChange={(event) => onValueChange(event.currentTarget.files?.[0]?.name ?? '')}
        />
        {typeof value === 'string' && value && <p className="text-xs text-text-muted">Selected: {value}</p>}
      </div>
    )
  }

  const inputType = field.type === 'number' || field.type === 'date' ? field.type : 'text'

  return (
    <div className="grid gap-1.5">
      {label}
      <Input
        id={`case-field-${field.key}`}
        type={inputType}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        placeholder={field.helpText ?? `Enter ${field.label.toLowerCase()}`}
      />
    </div>
  )
}
