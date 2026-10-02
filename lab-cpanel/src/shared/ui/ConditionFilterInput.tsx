import { useState } from 'react'
import { Filter, Plus, Search, X } from 'lucide-react'

import { Button } from './Button'
import { Input } from './Input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
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
  TOperator extends string,
> = {
  fields: readonly ConditionFilterField<TField, TOperator>[]
  conditions: ConditionFilterValue<TField, TOperator>[]
  onConditionsChange: (
    conditions: ConditionFilterValue<TField, TOperator>[],
  ) => void
  searchValue?: string
  onSearchValueChange?: (value: string) => void
  placeholder?: string
  resultCount?: number
  onClear?: () => void
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
>({
  fields,
  conditions,
  onConditionsChange,
  searchValue = '',
  onSearchValueChange,
  placeholder = 'Search or add a condition…',
  resultCount,
  onClear,
}: ConditionFilterInputProps<TField, TOperator>) {
  const firstField = fields[0]
  const [open, setOpen] = useState(false)
  const [fieldId, setFieldId] = useState<TField | ''>(firstField?.id ?? '')
  const activeField = fields.find((field) => field.id === fieldId) ?? firstField
  const [operator, setOperator] = useState<TOperator>(
    activeField?.operators[0] ?? ('is' as TOperator),
  )
  const [value, setValue] = useState('')
  const hasFilters = conditions.length > 0 || searchValue.length > 0

  function changeField(nextFieldId: string | null) {
    const nextField = fields.find((field) => field.id === nextFieldId)
    if (!nextField) return
    setFieldId(nextField.id)
    setOperator(nextField.operators[0])
    setValue('')
  }

  function addCondition() {
    if (!activeField || !value.trim()) return
    onConditionsChange([
      ...conditions,
      { field: activeField.id, operator, value: value.trim() },
    ])
    setValue('')
    setOpen(false)
  }

  function removeCondition(index: number) {
    onConditionsChange(conditions.filter((_, conditionIndex) => conditionIndex !== index))
  }

  function getConditionLabel(condition: ConditionFilterValue<TField, TOperator>) {
    const fieldLabel = fields.find((field) => field.id === condition.field)?.label
      ?? condition.field
    const opLabel = operatorLabels[condition.operator as ConditionFilterOperator]
      ?? condition.operator
    return `${fieldLabel} ${opLabel} ${condition.value}`
  }

  return (
    <div className="grid w-full gap-2">
      <div className="flex min-h-control-md w-full flex-wrap items-center gap-1.5 rounded-sm border border-field-border bg-surface px-2.5 py-1.5 shadow-xs transition-colors focus-within:border-border-focus focus-within:ring-3 focus-within:ring-ring">
        <Search aria-hidden="true" className="size-(--icon-size-sm) shrink-0 text-text-muted" />
        {conditions.map((condition, index) => (
          <span
            key={`${condition.field}-${condition.operator}-${condition.value}-${index}`}
            className="inline-flex max-w-full items-center gap-1 rounded-xs bg-neutral-50 px-1.5 py-0.5 text-xs text-text-primary"
          >
            <span className="truncate">{getConditionLabel(condition)}</span>
            <button
              type="button"
              className="grid size-4 shrink-0 place-items-center rounded-xs text-text-muted hover:bg-neutral-200 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-focus"
              aria-label={`Remove ${getConditionLabel(condition)} condition`}
              onClick={() => removeCondition(index)}
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          </span>
        ))}
        <Input
          aria-label="Search cases"
          className="h-7 min-w-40 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"
          placeholder={placeholder}
          value={searchValue}
          onChange={(event) => onSearchValueChange?.(event.target.value)}
          onClick={() => setOpen(true)}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false)
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Add filter condition"
                aria-expanded={open}
              />
            }
          >
            <Filter aria-hidden="true" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-3">
            <div className="grid gap-3">
              <div className="grid gap-0.5">
                <p className="font-semibold text-text-primary">Add filter condition</p>
                <p className="text-xs text-text-secondary">Choose a field and a condition.</p>
              </div>
              {activeField && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="grid gap-1 text-xs font-medium text-text-secondary">
                      Field
                      <Select value={activeField.id} onValueChange={changeField}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fields.map((field) => (
                            <SelectItem key={field.id} value={field.id}>{field.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="grid gap-1 text-xs font-medium text-text-secondary">
                      Condition
                      <Select
                        value={operator}
                        onValueChange={(nextOperator) => {
                          if (nextOperator !== null) setOperator(nextOperator as TOperator)
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {activeField.operators.map((fieldOperator) => (
                            <SelectItem key={fieldOperator} value={fieldOperator}>
                              {operatorLabels[fieldOperator as ConditionFilterOperator] ?? fieldOperator}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                  </div>
                  <label className="grid gap-1 text-xs font-medium text-text-secondary">
                    Value
                    {activeField.valueKind === 'select' ? (
                      <Select value={value || null} onValueChange={(nextValue) => setValue(nextValue ?? '')}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a value" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeField.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={activeField.valueKind === 'date' ? 'date' : 'text'}
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        aria-label={`${activeField.label} filter value`}
                      />
                    )}
                  </label>
                  <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    disabled={!value.trim()}
                    onClick={addCondition}
                  >
                    <Plus aria-hidden="true" />
                    Add condition
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {(resultCount !== undefined || (hasFilters && onClear)) && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-text-secondary">
            {resultCount !== undefined && `${resultCount} matching result${resultCount === 1 ? '' : 's'}`}
          </p>
          {hasFilters && onClear && (
            <Button type="button" variant="ghost" size="xs" onClick={onClear}>
              <X aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
