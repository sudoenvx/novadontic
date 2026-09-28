import { Card } from '../Card'
import { Table, TableHeader } from '../Table'
import { DataTableBody } from './DataTableBody'
import { DataTableHeader } from './DataTableHeader'
import { DataTableLoading } from './DataTableLoading'
import type { DataTableProps } from './types'
import { useDataTable } from './useDataTable'

export function DataTable<TData>({
  className,
  children,
  columns,
  data,
  defaultSelectedRowIds,
  description,
  emptyMessage = 'No records found.',
  getRowId,
  loading = false,
  loadingRowCount,
  onRowClick,
  onSelectionChange,
  pagination,
  selectable = false,
  selectedRowIds,
  title,
}: DataTableProps<TData>) {
  const {
    allRowsSelected,
    selectedIds,
    setSortState,
    someRowsSelected,
    sortState,
    sortedData,
    toggleAllRows,
    toggleRow,
  } = useDataTable({
    columns,
    data,
    defaultSelectedRowIds,
    getRowId,
    onSelectionChange,
    selectable,
    selectedRowIds,
  })
  const hasHeader = title !== undefined || description !== undefined || children !== undefined
  const rowCount = loadingRowCount ?? (data.length || 5)
  const columnCount = columns.length + (selectable ? 1 : 0)

  return (
    <Card className={className}>
      {hasHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid min-w-0 gap-0.5">
            {title !== undefined && <h2 className="text-base font-semibold uppercase text-primary">{title}</h2>}
            {description !== undefined && <p className="text-sm text-text-muted">{description}</p>}
          </div>
          {children}
        </div>
      )}
      <div className="scrollbar-brand overflow-x-auto rounded-sm overflow-hidden">
        <Table className="min-w-full">
          <TableHeader>
            <DataTableHeader
              allRowsSelected={allRowsSelected}
              columns={columns}
              onSortChange={setSortState}
              onToggleAll={toggleAllRows}
              selectable={selectable}
              someRowsSelected={someRowsSelected}
              sortState={sortState}
            />
          </TableHeader>
          {loading ? (
            <DataTableLoading columnCount={columnCount} rowCount={rowCount} />
          ) : (
            <DataTableBody
              columns={columns}
              emptyMessage={emptyMessage}
              getRowId={getRowId}
              onRowClick={onRowClick}
              onToggleRow={toggleRow}
              rows={sortedData}
              selectable={selectable}
              selectedIds={selectedIds}
            />
          )}
        </Table>
      </div>
      {pagination !== undefined && <div className="pt-1">{pagination}</div>}
    </Card>
  )
}
