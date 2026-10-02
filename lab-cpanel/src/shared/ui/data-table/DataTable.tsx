import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'cn'
import { useStore } from 'zustand'

import { Button } from '../Button'
import { Card } from '../Card'
import { Table, TableFooter, TableHeader } from '../Table'
import { useUserPreferenceScope } from '../../hooks/useUserPreferenceScope'
import { getUserPreferenceStorageKey } from '../../lib/userPreferenceStorage'
import { DataTableBody } from './DataTableBody'
import {
  createDataTableColumnStore,
  type DataTableColumnOption,
} from './dataTableColumnStore'
import { DataTableColumnStoreProvider } from './DataTableColumnStoreProvider'
import { DataTableEmptyState } from './DataTableEmptyState'
import { DataTableHeader } from './DataTableHeader'
import { DataTableLoading } from './DataTableLoading'
import { DataTableToolbar } from './DataTableToolbar'
import type { DataTableProps, DataTableSortState } from './types'
import { useDataTable } from './useDataTable'

export function DataTable<TData>(props: DataTableProps<TData>) {
  const userId = useUserPreferenceScope()

  return <DataTableInstance key={userId ?? 'anonymous'} {...props} />
}

function DataTableInstance<TData>({
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
  persistenceKey,
  selectable = false,
  selectedRowIds,
  title,
  toolbar,
  bulkActions,
  footer,
  compact = false,
  bodyMaxHeight = 'min(66vh, 42rem)',
}: DataTableProps<TData>) {
  const userId = useUserPreferenceScope()
  const userPersistenceKey = getUserPreferenceStorageKey(
    userId,
    persistenceKey ? `data-table:${persistenceKey}` : undefined,
  )
  const [preferences, setPreferences] = useState(
    () => loadTablePreferences(userPersistenceKey, columns, defaultPinnedColumnIds),
  )
  const { pinnedColumnIds, sortState: initialSortState } = preferences
  const [columnStore] = useState(() => createDataTableColumnStore(
    getColumnOptions(columns),
    columns.filter((column) => !preferences.hiddenColumnIds.includes(column.id)).map((column) => column.id),
  ))
  const visibleColumnIds = useStore(columnStore, (state) => state.visibleColumnIds)
  const hiddenColumnIds = useMemo(
    () => columns.filter((column) => !visibleColumnIds.includes(column.id)).map((column) => column.id),
    [columns, visibleColumnIds],
  )
  const hiddenColumnIdsRef = useRef(hiddenColumnIds)
  const visibleColumns = useMemo(
    () => columns.filter((column) => visibleColumnIds.includes(column.id)),
    [columns, visibleColumnIds],
  )
  const pinnedColumns = useMemo(
    () => new Set(
      pinnedColumnIds.filter((id) =>
        visibleColumns.some((column) => column.id === id && column.pinnable === true),
      ),
    ),
    [pinnedColumnIds, visibleColumns],
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
    defaultSortState: initialSortState,
    onSelectionChange,
    selectable,
    selectedRowIds,
  })
  const hasHeader = title !== undefined
    || description !== undefined
    || children !== undefined
    || columns.length > 1
  const rowCount = loadingRowCount ?? (data.length || 5)
  const columnCount = visibleColumns.length + (selectable ? 1 : 0)
  const selection = {
    selectedIds: Array.from(selectedIds),
    selectedRows,
    clearSelection,
  }
  const selectionActions = bulkActions?.(selection)

  useEffect(() => {
    const currentColumnIds = new Set(columnStore.getState().columns.map((column) => column.id))
    const currentVisibleColumnIds = new Set(columnStore.getState().visibleColumnIds)
    columnStore.getState().setColumns(
      getColumnOptions(columns),
      columns
        .filter((column) => currentVisibleColumnIds.has(column.id) || !currentColumnIds.has(column.id))
        .map((column) => column.id),
    )
  }, [columnStore, columns])

  useEffect(() => {
    hiddenColumnIdsRef.current = hiddenColumnIds
  }, [hiddenColumnIds])

  useEffect(() => {
    persistTablePreferences(userPersistenceKey, {
      sortState,
      pinnedColumnIds,
      hiddenColumnIds: hiddenColumnIdsRef.current,
    })
  }, [userPersistenceKey, pinnedColumnIds, sortState, visibleColumnIds])

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
    const nextPinnedColumnIds = pinnedColumnIds.includes(columnId)
      ? pinnedColumnIds.filter((id) => id !== columnId)
      : [...pinnedColumnIds, columnId]
    updatePreferences({
      sortState,
      pinnedColumnIds: nextPinnedColumnIds,
      hiddenColumnIds,
    })
  }

  function updateSortState(nextSortState: typeof sortState) {
    setSortState(nextSortState)
    updatePreferences({
      sortState: nextSortState,
      pinnedColumnIds,
      hiddenColumnIds,
    })
  }

  function updatePreferences(nextPreferences: TablePreferences) {
    setPreferences(nextPreferences)
    persistTablePreferences(userPersistenceKey, nextPreferences)
  }

  return (
    <DataTableColumnStoreProvider store={columnStore}>
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
            <div className="flex items-center gap-1">
              {children}
            </div>
          </div>
        )}

        {toolbar !== undefined && (
          <DataTableToolbar variant="filters">{toolbar}</DataTableToolbar>
        )}

        {selectable && selectedIds.size > 0 && (
          <DataTableToolbar variant="selection">
            <p className="text-sm font-semibold text-primary-soft-foreground" aria-live="polite">
              {selectedIds.size} selected
            </p>
            <div className="ms-auto flex items-center gap-2">
              {selectionActions}
              <Button type="button" variant="ghost" size="xs" onClick={clearSelection}>
                Clear
              </Button>
            </div>
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
                columns={visibleColumns}
                hasPinnedColumns={pinnedColumns.size > 0}
                pinnedColumns={pinnedColumns}
                onTogglePinnedColumn={togglePinnedColumn}
                onSortChange={updateSortState}
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
                columns={visibleColumns}
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
    </DataTableColumnStoreProvider>
  )
}

function getColumnOptions<TData>(columns: DataTableProps<TData>['columns']): DataTableColumnOption[] {
  return columns.map((column) => ({
    id: column.id,
    label: typeof column.header === 'string' ? column.header : column.id,
    showInColumnVisualizer: column.showInColumnVisualizer,
  }))
}

type TablePreferences = {
  sortState?: DataTableSortState
  pinnedColumnIds: string[]
  hiddenColumnIds: string[]
}

function loadTablePreferences<TData>(
  persistenceKey: string | undefined,
  columns: DataTableProps<TData>['columns'],
  defaultPinnedColumnIds: string[] | undefined,
): TablePreferences {
  const defaults: TablePreferences = {
    pinnedColumnIds: (defaultPinnedColumnIds ?? []).filter((id) =>
      columns.some((column) => column.id === id && column.pinnable === true),
    ),
    hiddenColumnIds: [],
  }
  if (!persistenceKey) return defaults

  try {
    const stored = window.localStorage.getItem(persistenceKey)
    if (!stored) return defaults
    const parsed: unknown = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object') return defaults

    const value = parsed as Partial<TablePreferences>
    const pinnedColumnIds = Array.isArray(value.pinnedColumnIds)
      ? value.pinnedColumnIds.filter((id): id is string =>
          typeof id === 'string'
          && columns.some((column) => column.id === id && column.pinnable === true),
        )
      : defaults.pinnedColumnIds
    const storedHiddenColumnIds = Array.isArray(value.hiddenColumnIds)
      ? value.hiddenColumnIds.filter((id): id is string =>
          typeof id === 'string' && columns.some((column) => column.id === id),
        )
      : []
    const hiddenColumnIds = columns.every((column) => storedHiddenColumnIds.includes(column.id))
      ? []
      : storedHiddenColumnIds
    const sortColumn = columns.find((column) =>
      column.id === value.sortState?.columnId && column.sortable === true,
    )
    const sortState = sortColumn
      && (value.sortState?.direction === 'asc' || value.sortState?.direction === 'desc')
      ? value.sortState
      : undefined

    return { pinnedColumnIds, hiddenColumnIds, sortState }
  } catch {
    return defaults
  }
}

function persistTablePreferences(
  persistenceKey: string | undefined,
  preferences: TablePreferences,
) {
  if (!persistenceKey) return
  try {
    window.localStorage.setItem(
      persistenceKey,
      JSON.stringify(preferences),
    )
  } catch {
    // Table controls remain usable when browser storage is unavailable.
  }
}
