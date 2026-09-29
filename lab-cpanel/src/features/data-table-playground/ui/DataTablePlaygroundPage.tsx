import { useMemo, useState } from 'react'

import { Badge, type BadgeTone } from '../../../shared/ui/Badge'
import { DataTable, type DataTableColumn } from '../../../shared/ui/data-table'
import { Pagination } from '../../../shared/ui/Pagination'
import { Page } from '../../../shared/ui/Page'
import { playgroundCases, type PlaygroundCase } from '../data/playgroundCases'

const statusTone: Record<PlaygroundCase['status'], BadgeTone> = {
  'On track': 'success',
  'Due today': 'warning',
  'Needs attention': 'destructive',
}

const columns: DataTableColumn<PlaygroundCase>[] = [
  { id: 'id', header: 'Case', accessorKey: 'id', sortable: true, pinnable: true, className: 'font-semibold text-text' },
  {
    id: 'patient',
    header: 'Patient',
    sortable: true,
    pinnable: true,
    sortValue: (row) => row.patient,
    cell: (row) => (
      <div>
        <p className="font-semibold text-text">{row.patient}</p>
        <p className="text-xs text-text-muted">{row.clinic}</p>
      </div>
    ),
  },
  { id: 'appliance', header: 'Appliance', accessorKey: 'appliance', sortable: true, pinnable: true, className: 'text-secondary' },
  { id: 'stage', header: 'Stage', accessorKey: 'stage', sortable: true, pinnable: true, className: 'text-secondary' },
  { id: 'due', header: 'Due', accessorKey: 'due', sortable: true, pinnable: true, className: 'text-secondary' },
  {
    id: 'status',
    header: 'Status',
    sortable: true,
    pinnable: true,
    sortValue: (row) => row.status,
    cell: (row) => <Badge tone={statusTone[row.status]}>{row.status}</Badge>,
  },
]

const pageSize = 5

export function DataTablePlaygroundPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCaseId, setSelectedCaseId] = useState<string>()
  const totalPages = Math.ceil(playgroundCases.length / pageSize)
  const visibleCases = useMemo(
    () => playgroundCases.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage],
  )

  return (
    <Page size="full">
      <DataTable
        title="Case data table"
        description="Development playground for generic columns, custom cells, and injected pagination."
        columns={columns}
        data={visibleCases}
        getRowId={(row) => row.id}
        selectable
        onRowClick={(row) => setSelectedCaseId(row.id)}
        pagination={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={playgroundCases.length}
            perPage={pageSize}
            onPageChange={setCurrentPage}
          />
        }
      />
      {selectedCaseId && <p className="text-sm text-secondary">Selected case: <span className="font-semibold text-text">{selectedCaseId}</span></p>}
    </Page>
  )
}
