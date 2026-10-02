import { useEffect, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useHotkey } from '@tanstack/react-hotkeys'

import { Button } from './Button'
import { Input } from './Input'
import { useUserPreferenceScope } from '../hooks/useUserPreferenceScope'
import { getUserPreferenceStorageKey } from '../lib/userPreferenceStorage'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
} from './Popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select'

export type ConditionFilterOperator =
  | 'is'
  | 'is-not'
  | 'contains'
  | 'greater-than'
  | 'less-than'
  | 'on-or-after'
  | 'on-or-before'

export type ConditionFilterValue<TField extends string, TOperator extends string> = {
  field: TField
  operator: TOperator
  value: string
}

export type ConditionFilterField<TField extends string, TOperator extends string> = {
  id: TField
  label: string
  operators: readonly TOperator[]
  valueKind?: 'text' | 'date' | 'select'
  options?: readonly { value: string; label: string }[]
}

type ConditionFilterInputProps<
  TField extends string,
  TOperator extends ConditionFilterOperator,
> = {
  fields: readonly ConditionFilterField<TField, TOperator>[]
  conditions: ConditionFilterValue<TField, TOperator>[]
  onConditionsChange: (
    conditions: ConditionFilterValue<TField, TOperator>[],
  ) => void
  searchValue?: string
  onSearchValueChange?: (value: string) => void
  onPersistedStateChange?: (state: {
    conditions: ConditionFilterValue<TField, TOperator>[]
    searchValue: string
  }) => void
  placeholder?: string
  persistenceKey?: string
}

type ConditionDraft<TField extends string, TOperator extends ConditionFilterOperator> = {
  field: TField | ''
  operator: TOperator | ''
  value: string
}

const operatorLabels: Record<ConditionFilterOperator, string> = {
  is: 'is',
  'is-not': 'is not',
  contains: 'contains',
  'greater-than': 'greater than',
  'less-than': 'less than',
  'on-or-after': 'on or after',
  'on-or-before': 'on or before',
}

export function ConditionFilterInput<
  TField extends string,
  TOperator extends ConditionFilterOperator,
>(props: ConditionFilterInputProps<TField, TOperator>) {
  const userId = useUserPreferenceScope()

  return (
    <ConditionFilterInputInstance
      key={userId ?? 'anonymous'}
      {...props}
    />
  )
}

function ConditionFilterInputInstance<
  TField extends string,
  TOperator extends ConditionFilterOperator,
>({
  fields,
  conditions,
  onConditionsChange,
  searchValue = '',
  onSearchValueChange,
  onPersistedStateChange,
  placeholder = 'Search or add a condition…',
  persistenceKey,
}: ConditionFilterInputProps<TField, TOperator>) {
  const [open, setOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number>()
  const [draft, setDraft] = useState<ConditionDraft<TField, TOperator>>(
    () => createEmptyDraft(fields),
  )
  const userId = useUserPreferenceScope()
  const anchorRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const restoredKeys = useRef(new Set<string>())
  const callbacksRef = useRef({
    onConditionsChange,
    onSearchValueChange,
    onPersistedStateChange,
  })
  const activeField = fields.find((field) => field.id === draft.field)
  const canApply = Boolean(activeField && draft.operator && draft.value.trim())
  const storageKey = getUserPreferenceStorageKey(
    userId,
    persistenceKey ? `condition-filter:${persistenceKey}` : undefined,
  )

  useHotkey('Escape', (event) => {
    event.preventDefault()
    setOpen(false)
  }, { enabled: open })

  useEffect(() => {
    callbacksRef.current = {
      onConditionsChange,
      onSearchValueChange,
      onPersistedStateChange,
    }
  })

  useEffect(() => {
    if (!storageKey || restoredKeys.current.has(storageKey)) return
    restoredKeys.current.add(storageKey)
    const stored = readStoredFilter(storageKey, fields)
    if (!stored) return
    if (callbacksRef.current.onPersistedStateChange) {
      callbacksRef.current.onPersistedStateChange(stored)
      return
    }
    callbacksRef.current.onConditionsChange(stored.conditions)
    callbacksRef.current.onSearchValueChange?.(stored.searchValue)
  }, [fields, storageKey])

  useEffect(() => {
    if (!open) return

    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Node)) return
      if (anchorRef.current?.contains(target) || popupRef.current?.contains(target)) return
      if (target instanceof Element && target.closest('[data-slot="select-content"]')) return
      setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer, true)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer, true)
    }
  }, [open])

  function beginAdd() {
    setEditingIndex(undefined)
    setDraft(createEmptyDraft(fields))
    setOpen(true)
  }

  function beginEdit(index: number) {
    const condition = conditions[index]
    if (!condition) return
    setEditingIndex(index)
    setDraft(condition)
    setOpen(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setEditingIndex(undefined)
      return
    }
    if (editingIndex === undefined) setDraft(createEmptyDraft(fields))
  }

  function updateField(fieldId: string | null) {
    const field = fields.find((item) => item.id === fieldId)
    if (!field) return
    setDraft({ field: field.id, operator: field.operators[0] ?? '', value: '' })
  }

  function applyCondition() {
    if (!activeField || !draft.operator || !draft.value.trim()) return

    const condition: ConditionFilterValue<TField, TOperator> = {
      field: activeField.id,
      operator: draft.operator,
      value: draft.value.trim(),
    }

    if (editingIndex === undefined) {
      updateConditions([...conditions, condition])
    } else {
      updateConditions(
        conditions.map((current, index) => index === editingIndex ? condition : current),
      )
    }
    setOpen(false)
  }

  function removeCondition(index: number) {
    updateConditions(conditions.filter((_, conditionIndex) => conditionIndex !== index))
    if (editingIndex === index) {
      setOpen(false)
    } else if (editingIndex !== undefined && editingIndex > index) {
      setEditingIndex(editingIndex - 1)
    }
  }

  function updateConditions(nextConditions: ConditionFilterValue<TField, TOperator>[]) {
    onConditionsChange(nextConditions)
    writeStoredFilter(storageKey, { conditions: nextConditions, searchValue })
  }

  function updateSearchValue(nextSearchValue: string) {
    onSearchValueChange?.(nextSearchValue)
    writeStoredFilter(storageKey, { conditions, searchValue: nextSearchValue })
  }

  return (
    <Popover open={open} modal={false} onOpenChange={handleOpenChange}>
      <div
        ref={anchorRef}
        className={`flex min-h-control-md w-full flex-wrap items-center gap-1.5 rounded-sm border bg-surface px-1 py-0.5 shadow-xs transition-colors focus-within:border-border-focus focus-within:ring-3 focus-within:ring-ring ${
          open ? 'border-border-focus ring-3 ring-ring' : 'border-field-border'
        }`}
      >
        <ConditionFilterTokens
          conditions={conditions}
          fields={fields}
          onEdit={beginEdit}
          onRemove={removeCondition}
        />
        <Input
          aria-label="Search cases"
          aria-expanded={open}
          aria-haspopup="dialog"
          variant="bare"
          size="sm"
          className="h-control-sm min-w-40 flex-1 px-0 text-sm"
          placeholder={placeholder}
          value={searchValue}
          onChange={(event) => updateSearchValue(event.currentTarget.value)}
          onClick={() => {
            if (!open) beginAdd()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false)
            if (event.key === 'ArrowDown' && !open) beginAdd()
          }}
        />
      </div>
      <PopoverContent
        anchor={anchorRef}
        align="start"
        className="w-[min(24rem,calc(100vw-2rem))] p-2"
        ref={popupRef}
      >
        <div className="grid gap-2">
          <PopoverHeader>
            <PopoverTitle>
              {editingIndex === undefined ? 'Add filter condition' : 'Edit filter condition'}
            </PopoverTitle>
            <PopoverDescription>
              Choose a field, condition, and value.
            </PopoverDescription>
          </PopoverHeader>
          {activeField && (
            <ConditionEditor
              fields={fields}
              activeField={activeField}
              draft={draft}
              onFieldChange={updateField}
              onOperatorChange={(operator) => setDraft((current) => ({ ...current, operator }))}
              onValueChange={(value) => setDraft((current) => ({ ...current, value }))}
            />
          )}
          <Button
            type="button"
            variant="neutral"
            size="sm"
            disabled={!canApply}
            onClick={applyCondition}
          >
            <Plus aria-hidden="true" />
            {editingIndex === undefined ? 'Add condition' : 'Save condition'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

type StoredConditionFilter = {
  searchValue: string
  conditions: ConditionFilterValue<string, ConditionFilterOperator>[]
}

function readStoredFilter<TField extends string, TOperator extends ConditionFilterOperator>(
  key: string,
  fields: readonly ConditionFilterField<TField, TOperator>[],
): { searchValue: string; conditions: ConditionFilterValue<TField, TOperator>[] } | undefined {
  try {
    const stored = window.localStorage.getItem(key)
    if (!stored) return undefined

    const parsed: unknown = JSON.parse(stored)
    if (!isStoredConditionFilter(parsed, fields)) return undefined
    return parsed
  } catch {
    return undefined
  }
}

function isStoredConditionFilter<TField extends string, TOperator extends ConditionFilterOperator>(
  value: unknown,
  fields: readonly ConditionFilterField<TField, TOperator>[],
): value is { searchValue: string; conditions: ConditionFilterValue<TField, TOperator>[] } {
  if (!value || typeof value !== 'object') return false
  const stored = value as Partial<StoredConditionFilter>
  return typeof stored.searchValue === 'string'
    && Array.isArray(stored.conditions)
    && stored.conditions.every((condition) => {
      if (!condition || typeof condition !== 'object') return false
      const field = fields.find((item) => item.id === condition.field)
      return Boolean(
        field
        && typeof condition.value === 'string'
        && field.operators.some((operator) => operator === condition.operator),
      )
    })
}

function writeStoredFilter(
  key: string | undefined,
  value: StoredConditionFilter,
) {
  if (!key) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Filtering remains available when browser storage is unavailable.
  }
}

function ConditionFilterTokens<
  TField extends string,
  TOperator extends ConditionFilterOperator,
>({
  conditions,
  fields,
  onEdit,
  onRemove,
}: {
  conditions: ConditionFilterValue<TField, TOperator>[]
  fields: readonly ConditionFilterField<TField, TOperator>[]
  onEdit: (index: number) => void
  onRemove: (index: number) => void
}) {
  return conditions.map((condition, index) => {
    const label = describeCondition(condition, fields)
    return (
      <span
        key={`${condition.field}-${condition.operator}-${condition.value}-${index}`}
        className="inline-flex max-w-full items-center rounded-xs bg-surface-muted text-text-primary"
      >
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="max-w-full justify-start truncate font-medium text-text-primary"
          aria-label={`Edit ${label} condition`}
          onClick={() => onEdit(index)}
        >
          <span className="truncate">{label}</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="me-0.5"
          aria-label={`Remove ${label} condition`}
          onClick={() => onRemove(index)}
        >
          <X aria-hidden="true" />
        </Button>
      </span>
    )
  })
}

function ConditionEditor<
  TField extends string,
  TOperator extends ConditionFilterOperator,
>({
  fields,
  activeField,
  draft,
  onFieldChange,
  onOperatorChange,
  onValueChange,
}: {
  fields: readonly ConditionFilterField<TField, TOperator>[]
  activeField: ConditionFilterField<TField, TOperator>
  draft: ConditionDraft<TField, TOperator>
  onFieldChange: (fieldId: string | null) => void
  onOperatorChange: (operator: TOperator) => void
  onValueChange: (value: string) => void
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1 text-xs font-medium text-text-secondary">
          Field
          <Select value={activeField.id} onValueChange={onFieldChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <ConditionOperatorSelect
          operators={activeField.operators}
          value={draft.operator}
          onChange={onOperatorChange}
        />
      </div>
      <ConditionValueInput
        field={activeField}
        value={draft.value}
        onChange={onValueChange}
      />
    </>
  )
}

function ConditionOperatorSelect<TOperator extends ConditionFilterOperator>({
  operators,
  value,
  onChange,
}: {
  operators: readonly TOperator[]
  value: TOperator | ''
  onChange: (operator: TOperator) => void
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-text-secondary">
      Condition
      <Select
        value={value || null}
        onValueChange={(nextOperator) => {
          const selectedOperator = operators.find((operator) => operator === nextOperator)
          if (selectedOperator) onChange(selectedOperator)
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map((operator) => (
            <SelectItem key={operator} value={operator}>
              {operatorLabels[operator]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}

function ConditionValueInput<
  TField extends string,
  TOperator extends ConditionFilterOperator,
>({
  field,
  value,
  onChange,
}: {
  field: ConditionFilterField<TField, TOperator>
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-text-secondary">
      Value
      {field.valueKind === 'select' ? (
        <Select value={value || null} onValueChange={(nextValue) => onChange(nextValue ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a value" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type={field.valueKind === 'date' ? 'date' : 'text'}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          aria-label={`${field.label} filter value`}
        />
      )}
    </label>
  )
}

function createEmptyDraft<
  TField extends string,
  TOperator extends ConditionFilterOperator,
>(fields: readonly ConditionFilterField<TField, TOperator>[]): ConditionDraft<TField, TOperator> {
  const field = fields[0]
  return {
    field: field?.id ?? '',
    operator: field?.operators[0] ?? '',
    value: '',
  }
}

function describeCondition<TField extends string, TOperator extends ConditionFilterOperator>(
  condition: ConditionFilterValue<TField, TOperator>,
  fields: readonly ConditionFilterField<TField, TOperator>[],
) {
  const field = fields.find((item) => item.id === condition.field)
  const fieldLabel = field?.label ?? condition.field
  const operatorLabel = operatorLabels[condition.operator]
  const valueLabel = field?.options?.find((option) => option.value === condition.value)?.label
    ?? condition.value
  return `${fieldLabel} ${operatorLabel} ${valueLabel}`
}
