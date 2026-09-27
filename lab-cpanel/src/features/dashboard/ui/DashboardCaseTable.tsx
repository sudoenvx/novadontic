import { cn } from 'cn'

import { Badge, type BadgeTone } from '../../../shared/ui/Badge'
import { DataTable, type DataTableColumn } from '../../../shared/ui/data-table'
import type {
  CaseStatus,
  CaseType,
  DashboardCase,
} from '../domain/case'

const caseTypeColor: Record<CaseType, { color: string; foregroundColor: string }> = {
  'Clear aligners': {
    color: 'var(--color-primary-soft)',
    foregroundColor: 'var(--color-primary-soft-foreground)',
  },
  Retainers: {
    color: 'var(--color-accent-soft)',
    foregroundColor: 'var(--color-accent-soft-foreground)',
  },
  Expanders: {
    color: 'var(--color-primary-soft)',
    foregroundColor: 'var(--color-primary-soft-foreground)',
  },
  'Fixed appliances': {
    color: 'var(--color-accent-soft)',
    foregroundColor: 'var(--color-accent-soft-foreground)',
  },
}

const statusTone: Record<CaseStatus, BadgeTone> = {
  'On track': 'success',
  'Due today': 'warning',
  'Needs attention': 'destructive',
}

const columns: DataTableColumn<DashboardCase>[] = [
  {
    id: 'case',
    header: 'Case',
    sortValue: (row) => row.id,
    cell: (dashboardCase) => (
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {dashboardCase.assignee}
        </span>
        <div>
          <p className="font-semibold text-text">{dashboardCase.id}</p>
          <p className="text-sm text-text-muted">
            {dashboardCase.patientName} · {dashboardCase.clinic}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'case-type',
    header: 'Case type',
    accessorKey: 'caseType',
    cell: (dashboardCase) => (
      <Badge
        color={caseTypeColor[dashboardCase.caseType].color}
        foregroundColor={caseTypeColor[dashboardCase.caseType].foregroundColor}
      >
        {dashboardCase.caseType}
      </Badge>
    ),
  },
  { id: 'stage', header: 'Stage', accessorKey: 'stage', className: 'text-secondary' },
  {
    id: 'due-date',
    header: 'Due',
    accessorKey: 'dueDate',
    className: 'text-secondary',
    cell: (dashboardCase) => (
      <span className={cn(dashboardCase.dueDate === 'Today' && 'font-semibold text-warning')}>
        {dashboardCase.dueDate}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: (dashboardCase) => <Badge tone={statusTone[dashboardCase.status]}>{dashboardCase.status}</Badge>,
  },
]

type DashboardCaseTableProps = {
  cases: DashboardCase[]
}

export function DashboardCaseTable({ cases }: DashboardCaseTableProps) {
  return (
    <DataTable
      columns={columns}
      data={cases}
      emptyMessage="No cases for this appliance yet."
      getRowId={(dashboardCase) => dashboardCase.id}
    />
  )
}
