import { Search, X, RotateCcw } from 'lucide-react'

import { Button } from '../../../shared/ui/Button'
import { Tag } from '../../../shared/ui/Tag'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../../../shared/ui/InputGroup'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '../../../shared/ui/Select'
import type { CaseListFilters } from '../domain/case'

export type CaseFilterOptions = {
  appliances: string[]
  categories: string[]
  clinics: string[]
  stages: string[]
}

type CaseFiltersProps = {
  filters: CaseListFilters
  options: CaseFilterOptions
  totalCount: number
  onChange: (filters: CaseListFilters) => void
  onReset: () => void
}

export function CaseFilters({
  filters,
  options,
  totalCount,
  onChange,
  onReset,
}: CaseFiltersProps) {
  function updateFilter<Key extends keyof CaseListFilters>(
    key: Key,
    value: CaseListFilters[Key],
  ) {
    onChange({ ...filters, [key]: value })
  }

  const activeFilterChips: Array<{ id: string; label: string; onRemove: () => void }> = []

  if (filters.searchTerm.trim()) {
    activeFilterChips.push({
      id: 'search',
      label: `Search: "${filters.searchTerm}"`,
      onRemove: () => updateFilter('searchTerm', ''),
    })
  }
  if (filters.applianceType !== 'all') {
    activeFilterChips.push({
      id: 'appliance',
      label: `Appliance: ${filters.applianceType}`,
      onRemove: () => updateFilter('applianceType', 'all'),
    })
  }
  if (filters.category !== 'all') {
    activeFilterChips.push({
      id: 'category',
      label: `Category: ${filters.category}`,
      onRemove: () => updateFilter('category', 'all'),
    })
  }
  if (filters.clinicName !== 'all') {
    activeFilterChips.push({
      id: 'clinic',
      label: `Clinic: ${filters.clinicName}`,
      onRemove: () => updateFilter('clinicName', 'all'),
    })
  }
  if (filters.stage !== 'all') {
    activeFilterChips.push({
      id: 'stage',
      label: `Stage: ${filters.stage}`,
      onRemove: () => updateFilter('stage', 'all'),
    })
  }
  if (filters.priority !== 'all') {
    activeFilterChips.push({
      id: 'priority',
      label: `Priority: ${filters.priority}`,
      onRemove: () => updateFilter('priority', 'all'),
    })
  }
  if (filters.status !== 'all') {
    activeFilterChips.push({
      id: 'status',
      label: `Status: ${filters.status}`,
      onRemove: () => updateFilter('status', 'all'),
    })
  }

  return (
    <div className="grid gap-2.5">
      {/* Main Filter Controls Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="min-w-55 flex-1">
          <InputGroup variant="outline">
            <InputGroupAddon align="inline-start">
              <Search size={14} className="text-text-muted" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by case #, patient, clinic, doctor..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              aria-label="Search cases"
            />
            {filters.searchTerm && (
              <InputGroupButton
                size="xs"
                variant="ghost"
                onClick={() => updateFilter('searchTerm', '')}
                aria-label="Clear search"
              >
                <X size={13} />
              </InputGroupButton>
            )}
          </InputGroup>
        </div>

        {/* Appliance Dropdown Filter */}
        <div className="w-35">
          <Select
            items={[
              { value: 'all', label: 'All appliances' },
              ...options.appliances.map((appliance) => ({
                value: appliance,
                label: appliance,
              })),
            ]}
            value={filters.applianceType}
            onValueChange={(val) => updateFilter('applianceType', val ?? 'all')}
          >
            <SelectTrigger  className="w-full text-xs">
              <span className="truncate">
                {filters.applianceType === 'all'
                  ? 'Appliance: All'
                  : `Appliance: ${filters.applianceType}`}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All appliances</SelectItem>
              {options.appliances.map((appliance) => (
                <SelectItem key={appliance} value={appliance}>
                  {appliance}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Dropdown Filter */}
        <div className="w-35">
          <Select
            items={[
              { value: 'all', label: 'All categories' },
              ...options.categories.map((category) => ({
                value: category,
                label: category,
              })),
            ]}
            value={filters.category}
            onValueChange={(val) => updateFilter('category', val ?? 'all')}
          >
            <SelectTrigger  className="w-full text-xs">
              <span className="truncate">
                {filters.category === 'all'
                  ? 'Category: All'
                  : `Category: ${filters.category}`}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {options.categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clinic Dropdown Filter */}
        <div className="w-35">
          <Select
            items={[
              { value: 'all', label: 'All clinics' },
              ...options.clinics.map((clinic) => ({ value: clinic, label: clinic })),
            ]}
            value={filters.clinicName}
            onValueChange={(value) => updateFilter('clinicName', value ?? 'all')}
          >
            <SelectTrigger className="w-full text-xs">
              <span className="truncate">
                {filters.clinicName === 'all' ? 'Clinic: All' : `Clinic: ${filters.clinicName}`}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clinics</SelectItem>
              {options.clinics.map((clinic) => (
                <SelectItem key={clinic} value={clinic}>{clinic}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stage Dropdown Filter */}
        <div className="w-35">
          <Select
            items={[
              { value: 'all', label: 'All stages' },
              ...options.stages.map((stage) => ({
                value: stage,
                label: stage,
              })),
            ]}
            value={filters.stage}
            onValueChange={(val) => updateFilter('stage', val ?? 'all')}
          >
            <SelectTrigger  className="w-full text-xs">
              <span className="truncate">
                {filters.stage === 'all'
                  ? 'Stage: All'
                  : `Stage: ${filters.stage}`}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {options.stages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="w-32.5">
          <Select
            items={[
              { value: 'all', label: 'All priorities' },
              { value: 'Normal', label: 'Normal' },
              { value: 'Rush', label: 'Rush' },
            ]}
            value={filters.priority}
            onValueChange={(val) => updateFilter('priority', val ?? 'all')}
          >
            <SelectTrigger  className="w-full text-xs">
              <span className="truncate">
                {filters.priority === 'all'
                  ? 'Priority: All'
                  : `Priority: ${filters.priority}`}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Rush">Rush</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-35">
          <Select
            items={[
              { value: 'all', label: 'All statuses' },
              { value: 'On track', label: 'On track' },
              { value: 'Due today', label: 'Due today' },
              { value: 'Needs attention', label: 'Needs attention' },
            ]}
            value={filters.status}
            onValueChange={(val) => updateFilter('status', val ?? 'all')}
          >
            <SelectTrigger  className="w-full text-xs">
              <span className="truncate">
                {filters.status === 'all'
                  ? 'Status: All'
                  : `Status: ${filters.status}`}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="On track">On track</SelectItem>
              <SelectItem value="Due today">Due today</SelectItem>
              <SelectItem value="Needs attention">Needs attention</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Chips Row */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border-soft pt-2" aria-label="Active case filters">
          <span className="text-xs font-semibold text-text-secondary">
            Active filters
          </span>
          {activeFilterChips.map((chip) => (
            <Tag
              key={chip.id}
              tone="neutral"
              className="gap-1 py-0.5 pe-0.5"
            >
              <span className="wrap-break-word">{chip.label}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-5 min-w-5 rounded-xs"
                aria-label={`Remove ${chip.label} filter`}
                onClick={chip.onRemove}
              >
                <X size={12} aria-hidden="true" />
              </Button>
            </Tag>
          ))}
          <span className="ms-auto text-xs text-text-secondary">
            {totalCount} matching case{totalCount === 1 ? '' : 's'}
          </span>
          <Button type="button" variant="ghost" size="xs" onClick={onReset}>
            <RotateCcw size={13} aria-hidden="true" />
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}
