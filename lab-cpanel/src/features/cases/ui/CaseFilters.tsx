import { Search, X, RotateCcw } from 'lucide-react'
import { useMemo } from 'react'

import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { FilterTabs, FilterTabsList, FilterTab } from '../../../shared/ui/FilterTabs'
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
  // Preset selector (Quick tab)
  const currentPreset = useMemo(() => {
    if (filters.status === 'Needs attention') return 'needs_attention'
    if (filters.status === 'Due today') return 'due_today'
    if (filters.priority === 'Rush') return 'rush'
    if (filters.stage !== 'all' && filters.stage !== 'Delivered') return 'active_stages'
    if (
      filters.applianceType === 'all' &&
      filters.category === 'all' &&
      filters.clinicName === 'all' &&
      filters.stage === 'all' &&
      filters.priority === 'all' &&
      filters.status === 'all'
    ) {
      return 'all'
    }
    return 'custom'
  }, [filters])

  function handlePresetChange(preset: string) {
    if (preset === 'all') {
      onChange({
        ...filters,
        applianceType: 'all',
        category: 'all',
        clinicName: 'all',
        stage: 'all',
        priority: 'all',
        status: 'all',
      })
    } else if (preset === 'needs_attention') {
      onChange({ ...filters, status: 'Needs attention' })
    } else if (preset === 'due_today') {
      onChange({ ...filters, status: 'Due today' })
    } else if (preset === 'rush') {
      onChange({ ...filters, priority: 'Rush' })
    }
  }

  function updateFilter<Key extends keyof CaseListFilters>(
    key: Key,
    value: CaseListFilters[Key],
  ) {
    onChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = Boolean(
    filters.searchTerm.trim() ||
      filters.applianceType !== 'all' ||
      filters.category !== 'all' ||
      filters.clinicName !== 'all' ||
      filters.stage !== 'all' ||
      filters.priority !== 'all' ||
      filters.status !== 'all',
  )

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; onRemove: () => void }> = []

    if (filters.searchTerm.trim()) {
      chips.push({
        id: 'search',
        label: `Search: "${filters.searchTerm}"`,
        onRemove: () => updateFilter('searchTerm', ''),
      })
    }
    if (filters.applianceType !== 'all') {
      chips.push({
        id: 'appliance',
        label: `Appliance: ${filters.applianceType}`,
        onRemove: () => updateFilter('applianceType', 'all'),
      })
    }
    if (filters.category !== 'all') {
      chips.push({
        id: 'category',
        label: `Category: ${filters.category}`,
        onRemove: () => updateFilter('category', 'all'),
      })
    }
    if (filters.clinicName !== 'all') {
      chips.push({
        id: 'clinic',
        label: `Clinic: ${filters.clinicName}`,
        onRemove: () => updateFilter('clinicName', 'all'),
      })
    }
    if (filters.stage !== 'all') {
      chips.push({
        id: 'stage',
        label: `Stage: ${filters.stage}`,
        onRemove: () => updateFilter('stage', 'all'),
      })
    }
    if (filters.priority !== 'all') {
      chips.push({
        id: 'priority',
        label: `Priority: ${filters.priority}`,
        onRemove: () => updateFilter('priority', 'all'),
      })
    }
    if (filters.status !== 'all') {
      chips.push({
        id: 'status',
        label: `Status: ${filters.status}`,
        onRemove: () => updateFilter('status', 'all'),
      })
    }

    return chips
  }, [filters])

  return (
    <div className="grid gap-2.5">
      {/* Quick Preset Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <FilterTabs
          value={currentPreset === 'custom' ? undefined : currentPreset}
          onValueChange={handlePresetChange}
        >
          <FilterTabsList>
            <FilterTab value="all">All cases</FilterTab>
            <FilterTab value="needs_attention" color="#ef4444">
              Needs attention
            </FilterTab>
            <FilterTab value="due_today" color="#f59e0b">
              Due today
            </FilterTab>
            <FilterTab value="rush" color="#8b5cf6">
              Rush priority
            </FilterTab>
          </FilterTabsList>
        </FilterTabs>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onReset}
            className="text-text-muted hover:text-text h-7 gap-1"
          >
            <RotateCcw size={13} />
            <span>Reset filters</span>
          </Button>
        )}
      </div>

      {/* Main Filter Controls Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="min-w-[220px] flex-1">
          <InputGroup size="sm" variant="outline">
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
        <div className="w-[140px]">
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
        <div className="w-[140px]">
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

        {/* Stage Dropdown Filter */}
        <div className="w-[140px]">
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
        <div className="w-[130px]">
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
        <div className="w-[140px]">
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
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-2xs font-medium text-text-muted uppercase tracking-wider mr-1">
            Active:
          </span>
          {activeFilterChips.map((chip) => (
            <Badge
              key={chip.id}
              tone="neutral"
              className="group/chip inline-flex items-center gap-1 py-0.5 px-2 text-2xs transition-colors hover:bg-neutral-200 cursor-pointer"
              onClick={chip.onRemove}
            >
              <span>{chip.label}</span>
              <X
                size={11}
                className="text-text-muted group-hover/chip:text-text transition-colors"
                aria-hidden="true"
              />
            </Badge>
          ))}
          <span className="text-2xs text-text-muted ml-auto">
            {totalCount} matching case{totalCount === 1 ? '' : 's'}
          </span>
        </div>
      )}
    </div>
  )
}
