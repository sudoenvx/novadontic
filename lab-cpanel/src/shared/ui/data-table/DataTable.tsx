import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import { Card } from '../Card'
import { Table, TableHeader } from '../Table'
import { DataTableBody } from './DataTableBody'
import { DataTableHeader } from './DataTableHeader'
import { DataTableLoading } from './DataTableLoading'
import type { DataTableProps } from './types'
import { useDataTable } from './useDataTable'

/**
 * DataTable
 * ---------------------------------------------------------------------------
 * A full-featured, sortable, selectable data table with loading skeletons.
 *
 * Usage:
 *   <DataTable
 *     columns={columns}
 *     data={rows}
 *     title="Cases"
 *     description="All open cases"
 *     loading={isLoading}
 *     onRowClick={(row) => navigate(`/cases/${row.id}`)}
 *   >
 *     <DataTableActions>
 *       <Button size="sm">Export</Button>
 *     </DataTableActions>
 *   </DataTable>
 */
export function DataTable<TData>({
  className,
  children,
  columns,
  data,
  defaultPinnedColumnIds,
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
  const [pinnedColumnIds, setPinnedColumnIds] = useState<string[]>(
    () => defaultPinnedColumnIds ?? [],
  )
  const pinnedColumns = useMemo(
    () => new Set(
      pinnedColumnIds.filter((id) =>
        columns.some((column) => column.id === id && column.pinnable === true),
      ),
    ),
    [columns, pinnedColumnIds],
  )
  const tableWrapperRef = useRef<HTMLDivElement>(null)
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

  useLayoutEffect(() => {
    const wrapper = tableWrapperRef.current
    if (!wrapper) return

    const updatePinnedOffsets = () => {
      const headerCells = Array.from(
        wrapper.querySelectorAll<HTMLTableCellElement>('thead th[data-column-id]'),
      )
      const widths = new Map(
        headerCells.map((cell) => [cell.dataset.columnId!, cell.getBoundingClientRect().width]),
      )
      let left = selectable
        ? wrapper.querySelector<HTMLTableCellElement>('thead tr > th:first-child')?.getBoundingClientRect().width ?? 0
        : 0
      const offsets = new Map<string, number>()

      columns.forEach((column) => {
        if (!pinnedColumns.has(column.id)) return
        offsets.set(column.id, left)
        left += widths.get(column.id) ?? 0
      })

      wrapper.querySelectorAll<HTMLElement>('[data-column-id]').forEach((cell) => {
        const columnId = cell.dataset.columnId
        cell.style.left = columnId && offsets.has(columnId)
          ? `${offsets.get(columnId)}px`
          : ''
      })
    }

    const resizeObserver = new ResizeObserver(updatePinnedOffsets)
    const headerRow = wrapper.querySelector('thead tr')
    if (headerRow) resizeObserver.observe(headerRow)
    wrapper.querySelectorAll('thead th[data-column-id]').forEach((cell) => resizeObserver.observe(cell))
    updatePinnedOffsets()

    return () => resizeObserver.disconnect()
  }, [columns, pinnedColumns, selectable])

  function togglePinnedColumn(columnId: string) {
    setPinnedColumnIds((current) =>
      current.includes(columnId)
        ? current.filter((id) => id !== columnId)
        : [...current, columnId],
    )
  }

  return (
    <Card className={className} size="xs">
      {hasHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="grid min-w-0 gap-0.5">
            {title !== undefined && (
              <h2 className="text-base font-extrabold tracking-tight text-text-primary">{title}</h2>
            )}
            {description !== undefined && (
              <p className="text-sm text-text-secondary">{description}</p>
            )}
          </div>
          {children}
        </div>
      )}

      <div ref={tableWrapperRef} className="scrollbar-brand overflow-x-auto">
        <Table className="min-w-full border-separate border-spacing-0">
          <TableHeader>
            <DataTableHeader
              allRowsSelected={allRowsSelected}
              columns={columns}
              hasPinnedColumns={pinnedColumns.size > 0}
              pinnedColumns={pinnedColumns}
              onTogglePinnedColumn={togglePinnedColumn}
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
              hasPinnedColumns={pinnedColumns.size > 0}
              onRowClick={onRowClick}
              onToggleRow={toggleRow}
              rows={sortedData}
              pinnedColumns={pinnedColumns}
              selectable={selectable}
              selectedIds={selectedIds}
            />
          )}
        </Table>
      </div>

      {pagination !== undefined && (
        <div className="border-t border-border-soft px-card py-2">{pagination}</div>
      )}
    </Card>
  )
}
