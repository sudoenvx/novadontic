import {
  ConditionFilterInput,
  type ConditionFilterField,
} from '../../../shared/ui/ConditionFilterInput'
import type {
  CaseConditionField,
  CaseConditionOperator,
  CaseListFilters,
} from '../domain/case'

export type CaseFilterOptions = {
  appliances: string[]
  categories: string[]
  stages: string[]
}

type CaseFiltersProps = {
  filters: CaseListFilters
  options: CaseFilterOptions
  totalCount: number
  onChange: (filters: CaseListFilters) => void
  onReset: () => void
}

const equalityOperators: CaseConditionOperator[] = ['is', 'is-not']
const textOperators: CaseConditionOperator[] = [...equalityOperators, 'contains']
const dateOperators: CaseConditionOperator[] = [
  ...equalityOperators,
  'greater-than',
  'less-than',
  'on-or-after',
  'on-or-before',
]

export function CaseFilters({
  filters,
  options,
  totalCount,
  onChange,
  onReset,
}: CaseFiltersProps) {
  const fields: ConditionFilterField<CaseConditionField, CaseConditionOperator>[] = [
    {
      id: 'status',
      label: 'Status',
      operators: equalityOperators,
      valueKind: 'select',
      options: [
        { value: 'On track', label: 'On track' },
        { value: 'Due today', label: 'Due today' },
        { value: 'Needs attention', label: 'Needs attention' },
      ],
    },
    {
      id: 'priority',
      label: 'Priority',
      operators: equalityOperators,
      valueKind: 'select',
      options: [
        { value: 'Normal', label: 'Normal' },
        { value: 'Rush', label: 'Rush' },
      ],
    },
    {
      id: 'appliance',
      label: 'Appliance',
      operators: equalityOperators,
      valueKind: 'select',
      options: options.appliances.map((appliance) => ({ value: appliance, label: appliance })),
    },
    {
      id: 'category',
      label: 'Category',
      operators: equalityOperators,
      valueKind: 'select',
      options: options.categories.map((category) => ({ value: category, label: category })),
    },
    {
      id: 'clinic',
      label: 'Clinic name',
      operators: textOperators,
      valueKind: 'text',
    },
    {
      id: 'stage',
      label: 'Stage',
      operators: equalityOperators,
      valueKind: 'select',
      options: options.stages.map((stage) => ({ value: stage, label: stage })),
    },
    {
      id: 'dueDate',
      label: 'Due date',
      operators: dateOperators,
      valueKind: 'date',
    },
  ]

  return (
    <ConditionFilterInput
      fields={fields}
      conditions={filters.conditions}
      onConditionsChange={(conditions) => onChange({ ...filters, conditions })}
      searchValue={filters.searchTerm}
      onSearchValueChange={(searchTerm) => onChange({ ...filters, searchTerm })}
      placeholder="Search cases or add a condition…"
      resultCount={totalCount}
      onClear={onReset}
    />
  )
}
