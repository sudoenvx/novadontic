import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'cn'

import { Card } from '../Card'
import { Table, TableFooter, TableHeader } from '../Table'
import { DataTableBody } from './DataTableBody'
import { DataTableEmptyState } from './DataTableEmptyState'
import { DataTableHeader } from './DataTableHeader'
import { DataTableLoading } from './DataTableLoading'
import { DataTableToolbar } from './DataTableToolbar'
import type { DataTableProps } from './types'
import { useDataTable } from './useDataTable'

export function DataTable<TData>({
  className,
  children,
  columns,
  data,
  defaultPinnedColumnIds,
  defaultSelectedRowIds,
  description,
  emptyMessage = 'No records found.',
  emptyState,
  getRowId,
  loading = false,
  loadingRowCount,
  onRowClick,
  onSelectionChange,
  selectable = false,
  selectedRowIds,
  title,
  toolbar,
  bulkActions,
  footer,
  compact = false,
  bodyMaxHeight = 'min(66vh, 42rem)',
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
    clearSelection,
    selectedIds,
    selectedRows,
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
  const selection = {
    selectedIds: Array.from(selectedIds),
    selectedRows,
    clearSelection,
  }
  const selectionActions = bulkActions?.(selection)

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
    <Card className={cn(className, 'p-0 gap-0')} size="xs" data-slot="data-table">
      {hasHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-2 py-2">
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

      {toolbar !== undefined && (
        <DataTableToolbar variant="filters">{toolbar}</DataTableToolbar>
      )}

      {selectable && selectedIds.size > 0 && (
        <DataTableToolbar variant="selection">
          <p className="text-sm font-semibold text-text-primary" aria-live="polite">
            {selectedIds.size} selected
          </p>
          {selectionActions}
          <button
            type="button"
            className="ms-auto rounded-sm px-2 text-sm font-semibold text-text-secondary hover:bg-surface hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            onClick={clearSelection}
          >
            Clear
          </button>
        </DataTableToolbar>
      )}

      <div
        ref={tableWrapperRef}
        className="min-h-0 overflow-auto"
        style={{ maxHeight: bodyMaxHeight }}
      >
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
              emptyState={emptyState ?? <DataTableEmptyState title={emptyMessage} />}
              getRowId={getRowId}
              hasPinnedColumns={pinnedColumns.size > 0}
              onRowClick={onRowClick}
              onToggleRow={toggleRow}
              rows={sortedData}
              pinnedColumns={pinnedColumns}
              selectable={selectable}
              compact={compact}
              selectedIds={selectedIds}
            />
          )}
        </Table>
      </div>

      {footer !== undefined && (
        <TableFooter>{footer}</TableFooter>
      )}
    </Card>
  )
}
