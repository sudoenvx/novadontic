import { Flag, Search } from 'lucide-react'

import { Badge } from '../../../shared/ui/Badge'
import { Card } from '../../../shared/ui/Card'
import { FilterTab, FilterTabs, FilterTabsList } from '../../../shared/ui/FilterTabs'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../../../shared/ui/InputGroup'
import type { CasePipelineCase, CasePipelineFilter } from '../domain/casePipeline'

type CasePipelineSidebarProps = {
  cases: CasePipelineCase[]
  filter: CasePipelineFilter
  onFilterChange: (filter: CasePipelineFilter) => void
  onSearchChange: (value: string) => void
  onSelectCase: (caseId: string) => void
  searchTerm: string
  selectedCaseId: string
}

export function CasePipelineSidebar({
  cases,
  filter,
  onFilterChange,
  onSearchChange,
  onSelectCase,
  searchTerm,
  selectedCaseId,
}: CasePipelineSidebarProps) {
  const counts = {
    all: cases.length,
    active: cases.filter((caseItem) => caseItem.stage !== 'Delivered').length,
    rush: cases.filter((caseItem) => caseItem.priority === 'Rush').length,
  }

  return (
    <Card size="sm" className="min-h-0 lg:sticky lg:top-3 lg:self-start">
      <InputGroup variant="outline" size="md">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          value={searchTerm}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          placeholder="Search case or patient"
          aria-label="Search case or patient"
        />
      </InputGroup>
      <FilterTabs
        value={filter}
        onValueChange={(value) => {
          if (value === 'all' || value === 'active' || value === 'rush') {
            onFilterChange(value)
          }
        }}
        aria-label="Filter cases"
      >
        <FilterTabsList>
          <FilterTab value="all" count={counts.all}>All</FilterTab>
          <FilterTab value="active" count={counts.active}>Active</FilterTab>
          <FilterTab value="rush" count={counts.rush}>Rush</FilterTab>
        </FilterTabsList>
      </FilterTabs>
      <div className="grid max-h-[calc(100vh-12rem)] gap-1 overflow-y-auto pr-0.5">
        {cases.map((caseItem) => (
          <button
            key={caseItem.id}
            type="button"
            className={`grid gap-1 rounded-sm border-l-2 p-2 text-left transition-colors hover:bg-surface-muted ${selectedCaseId === caseItem.id ? 'border-primary bg-primary-soft' : 'border-transparent'}`}
            onClick={() => onSelectCase(caseItem.id)}
            aria-pressed={selectedCaseId === caseItem.id}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-text">{caseItem.id}</span>
              {caseItem.priority === 'Rush' && <Flag className="size-3.5 text-destructive" />}
            </span>
            <span className="truncate text-xs text-text-muted">
              {caseItem.patientName} · {caseItem.doctorName}
            </span>
            <span className="flex items-center justify-between gap-2">
              <Badge tone="info">{caseItem.caseType}</Badge>
              <span className={caseItem.status === 'Needs attention' ? 'text-destructive' : 'text-secondary'}>
                {caseItem.dueDate}
              </span>
            </span>
          </button>
        ))}
      </div>
    </Card>
  )
}
