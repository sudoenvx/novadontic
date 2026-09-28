import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

import { Badge, type BadgeTone } from '../../../shared/ui/Badge'
import { DataTable, type DataTableColumn } from '../../../shared/ui/data-table'
import type { CaseListItem } from '../domain/case'

const statusTone: Record<CaseListItem['status'], BadgeTone> = {
  'On track': 'success',
  'Due today': 'warning',
  'Needs attention': 'destructive',
}

const columns: DataTableColumn<CaseListItem>[] = [
  {
    id: 'case',
    header: 'Case',
    sortValue: (caseItem) => caseItem.id,
    cell: (caseItem) => (
      <Link to={`/cases/${caseItem.id}`} className="grid gap-0.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
        <span className="font-semibold text-primary">{caseItem.id}</span>
        <span className="text-xs text-text-muted">{caseItem.patientName} · {caseItem.patientCode}</span>
      </Link>
    ),
  },
  { id: 'appliance', header: 'Appliance', accessorKey: 'applianceType', className: 'text-secondary' },
  { id: 'category', header: 'Category', accessorKey: 'category', cell: (caseItem) => <Badge tone="accent">{caseItem.category}</Badge> },
  { id: 'doctor', header: 'Doctor', accessorKey: 'doctorName', className: 'text-secondary' },
  { id: 'stage', header: 'Stage', accessorKey: 'stage', cell: (caseItem) => <Badge tone={caseItem.stage === 'Delivered' ? 'success' : 'info'}>{caseItem.stage}</Badge> },
  { id: 'due-date', header: 'Due', accessorKey: 'dueDate', className: 'text-secondary' },
  { id: 'priority', header: 'Priority', accessorKey: 'priority', cell: (caseItem) => <Badge tone={caseItem.priority === 'Rush' ? 'destructive' : 'neutral'}>{caseItem.priority}</Badge> },
  { id: 'status', header: 'Status', accessorKey: 'status', cell: (caseItem) => <Badge tone={statusTone[caseItem.status]}>{caseItem.status}</Badge> },
]

export function CasesTable({ cases, pagination, totalCount }: { cases: CaseListItem[]; pagination: ReactNode; totalCount: number }) {
  return (
    <DataTable
      columns={columns}
      data={cases}
      title="All cases"
      description={`${totalCount} case${totalCount === 1 ? '' : 's'} match the current filters.`}
      emptyMessage="No cases match the current filters."
      getRowId={(caseItem) => caseItem.id}
      pagination={pagination}
    />
  )
}
