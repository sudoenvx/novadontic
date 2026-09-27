import { cn } from 'cn'

import { Badge, type BadgeTone } from '../../../shared/ui/Badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/ui/Table'
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

type DashboardCaseTableProps = {
  cases: DashboardCase[]
}

export function DashboardCaseTable({ cases }: DashboardCaseTableProps) {
  return (
    <div className="mt-2 overflow-x-auto">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead>Case</TableHead>
            <TableHead>Case type</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.length > 0 ? (
            cases.map((dashboardCase) => (
              <DashboardCaseRow
                key={dashboardCase.id}
                dashboardCase={dashboardCase}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-text-muted">
                No cases for this appliance yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function DashboardCaseRow({ dashboardCase }: { dashboardCase: DashboardCase }) {
  return (
    <TableRow>
      <TableCell>
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
      </TableCell>
      <TableCell>
        <Badge
          color={caseTypeColor[dashboardCase.caseType].color}
          foregroundColor={caseTypeColor[dashboardCase.caseType].foregroundColor}
        >
          {dashboardCase.caseType}
        </Badge>
      </TableCell>
      <TableCell className="text-secondary">{dashboardCase.stage}</TableCell>
      <TableCell
        className={cn(
          'text-secondary',
          dashboardCase.dueDate === 'Today' && 'font-semibold text-warning',
        )}
      >
        {dashboardCase.dueDate}
      </TableCell>
      <TableCell>
        <Badge tone={statusTone[dashboardCase.status]}>
          {dashboardCase.status}
        </Badge>
      </TableCell>
    </TableRow>
  )
}
