import { useMemo, useState } from 'react'

import { Badge, type BadgeTone } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import {
  DataTable,
  DataTableActions,
  DataTableColumnVisualizer,
  DataTableEmptyState,
  DataTableFooter,
  DataTablePagination,
  type DataTableColumn,
} from '../../../shared/ui/data-table'
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
    sortValue: (row) => row.patient,
    cell: (row) => (
      <div>
        <p className="font-semibold text-text">{row.patient}</p>
        <p className="text-xs text-text-muted">{row.clinic}</p>
      </div>
    ),
  },
  { id: 'appliance', header: 'Appliance', accessorKey: 'appliance', className: 'text-secondary' },
  { id: 'stage', header: 'Stage', accessorKey: 'stage', className: 'text-secondary' },
  { id: 'due', header: 'Due', accessorKey: 'due', sortable: true, className: 'text-secondary' },
  {
    id: 'status',
    header: 'Status',
    sortable: true,
    sortValue: (row) => row.status,
    cell: (row) => <Badge tone={statusTone[row.status]}>{row.status}</Badge>,
  },
]

export function DataTablePlaygroundPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [selectedCaseId, setSelectedCaseId] = useState<string>()
  const totalPages = Math.max(1, Math.ceil(playgroundCases.length / pageSize))
  const visibleCases = useMemo(
    () => playgroundCases.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, pageSize],
  )

  return (
    <Page size="full">
      <DataTable
        title="Case data table"
        description="Development playground for generic columns, custom cells, and composable table parts."
        columns={columns}
        data={visibleCases}
        persistenceKey="datatable-playground"
        emptyState={
          <DataTableEmptyState
            title="No cases match these filters"
            description="Try a different search, or clear the filters to see every case."
            action={
              <Button type="button" variant="neutral" size="sm" onClick={() => setCurrentPage(1)}>
                Clear filters
              </Button>
            }
          />
        }
        getRowId={(row) => row.id}
        selectable
        onRowClick={(row) => setSelectedCaseId(row.id)}
        footer={
          <DataTableFooter>
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={playgroundCases.length}
              perPage={pageSize}
              onPageChange={setCurrentPage}
              onPerPageChange={(nextPageSize) => {
                setPageSize(nextPageSize)
                setCurrentPage(1)
              }}
            />
          </DataTableFooter>
        }
      >
        <DataTableActions>
          <DataTableColumnVisualizer />
        </DataTableActions>
      </DataTable>
      {selectedCaseId && <p className="text-sm text-secondary">Selected case: <span className="font-semibold text-text">{selectedCaseId}</span></p>}
    </Page>
  )
}
