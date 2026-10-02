export type ApplianceSource = 'Platform default' | 'Custom type'

export type ApplianceFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'date'
  | 'checkbox'
  | 'file'
  | 'image'

export type ApplianceFieldOption = {
  label: string
  value: string
}

export type ApplianceField = {
  id: string
  groupId: string | null
  label: string
  key: string
  type: ApplianceFieldType
  required: boolean
  helpText: string | null
  defaultValue: string | null
  dependsOn: string | null
  dependsOnValue: string | null
  sortOrder: number
  options: ApplianceFieldOption[]
}

export type ApplianceFieldGroup = {
  id: string
  name: string
  sortOrder: number
  fields: ApplianceField[]
}

export type Appliance = {
  id: string
  code: string
  name: string
  source: ApplianceSource
  color: string | null
  isActive: boolean
  casesUsing: number | null
  groups: ApplianceFieldGroup[]
}

export type ApplianceTypeInput = {
  name: string
  color?: string | null
}

export type ApplianceFieldGroupInput = {
  name: string
  sortOrder?: number
}

export type ApplianceFieldInput = {
  key: string
  label: string
  type: ApplianceFieldType
  options: ApplianceFieldOption[]
  defaultValue?: string | null
  dependsOn?: string | null
  dependsOnValue?: string | null
  required?: boolean
  sortOrder?: number
  helpText?: string | null
}

export function getApplianceFieldCount(appliance: Appliance) {
  return appliance.groups.reduce((total, group) => total + group.fields.length, 0)
}

export function getApplianceGroupCount(appliance: Appliance) {
  return appliance.groups.length
}

export function getApplianceFields(appliance: Appliance) {
  return appliance.groups.flatMap((group) => group.fields)
}

export function isApplianceNameAvailable(
  appliances: Appliance[],
  name: string,
  ignoredId?: string,
) {
  return !appliances.some(
    (appliance) =>
      appliance.id !== ignoredId && appliance.name.toLowerCase() === name.trim().toLowerCase(),
  )
}

export function isApplianceFieldKeyAvailable(
  appliance: Appliance,
  key: string,
  ignoredFieldId?: string,
) {
  return !getApplianceFields(appliance).some(
    (field) => field.id !== ignoredFieldId && field.key === key.trim(),
  )
}

export function filterAppliances(appliances: Appliance[], searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  if (!normalizedSearch) {
    return appliances
  }

  return appliances.filter((appliance) =>
    [appliance.name, appliance.code].some((value) =>
      value.toLowerCase().includes(normalizedSearch),
    ),
  )
}

export function parseFieldOptions(value: string): ApplianceFieldOption[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [first, ...rest] = line.split('|').map((part) => part.trim())
      return rest.length > 0
        ? { value: first, label: rest.join('|') }
        : { value: first.toLowerCase().replace(/\s+/g, '_'), label: first }
    })
}

export function serializeFieldOptions(options: ApplianceFieldOption[]) {
  return options.map((option) => `${option.value}|${option.label}`).join('\n')
}
