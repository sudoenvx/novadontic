import { useMemo, useState } from 'react'

import type { DataTableColumn, DataTableSortState } from './types'

type UseDataTableOptions<TData> = {
  data: TData[]
  columns: DataTableColumn<TData>[]
  getRowId?: (row: TData, index: number) => string | number
  selectable?: boolean
  selectedRowIds?: Array<string | number>
  defaultSelectedRowIds?: Array<string | number>
  defaultSortState?: DataTableSortState
  onSelectionChange?: (rows: TData[]) => void
}

export function useDataTable<TData>({
  columns,
  data,
  defaultSelectedRowIds,
  defaultSortState,
  getRowId,
  onSelectionChange,
  selectable = false,
  selectedRowIds,
}: UseDataTableOptions<TData>) {
  const [sortState, setSortState] = useState<DataTableSortState | undefined>(defaultSortState)
  const [internalSelectedRowIds, setInternalSelectedRowIds] = useState(
    () => new Set((defaultSelectedRowIds ?? []).map(String)),
  )
  const sortedData = useMemo(
    () => sortData(data, columns, sortState),
    [columns, data, sortState],
  )
  const selectedIds = useMemo(
    () => new Set((selectedRowIds ?? Array.from(internalSelectedRowIds)).map(String)),
    [internalSelectedRowIds, selectedRowIds],
  )
  const selectedRows = useMemo(
    () => sortedData.filter((row, index) =>
      selectedIds.has(getRowKey(row, index, getRowId)),
    ),
    [getRowId, selectedIds, sortedData],
  )
  const rowIds = sortedData.map((row, index) => getRowKey(row, index, getRowId))
  const selectedVisibleCount = rowIds.filter((rowId) => selectedIds.has(rowId)).length
  const allRowsSelected = selectable && rowIds.length > 0 && selectedVisibleCount === rowIds.length
  const someRowsSelected = selectable && selectedVisibleCount > 0 && !allRowsSelected

  function updateSelection(nextIds: Set<string>) {
    if (selectedRowIds === undefined) setInternalSelectedRowIds(nextIds)
    onSelectionChange?.(
      sortedData.filter((row, index) => nextIds.has(getRowKey(row, index, getRowId))),
    )
  }

  function toggleRow(row: TData, index: number) {
    const nextIds = new Set(selectedIds)
    const rowId = getRowKey(row, index, getRowId)
    if (nextIds.has(rowId)) nextIds.delete(rowId)
    else nextIds.add(rowId)
    updateSelection(nextIds)
  }

  function toggleAllRows() {
    const nextIds = new Set(selectedIds)
    if (allRowsSelected) rowIds.forEach((rowId) => nextIds.delete(rowId))
    else rowIds.forEach((rowId) => nextIds.add(rowId))
    updateSelection(nextIds)
  }

  function clearSelection() {
    updateSelection(new Set())
  }

  return {
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
  }
}

export function getRowKey<TData>(row: TData, index: number, getRowId?: (row: TData, index: number) => string | number) {
  return String(getRowId?.(row, index) ?? index)
}

function sortData<TData>(data: TData[], columns: DataTableColumn<TData>[], sortState?: DataTableSortState) {
  if (!sortState) return data

  const column = columns.find((item) => item.id === sortState.columnId)
  if (!column) return data

  return [...data].sort((leftRow, rightRow) => {
    const comparison = compareValues(getSortValue(leftRow, column), getSortValue(rightRow, column))
    return sortState.direction === 'asc' ? comparison : comparison * -1
  })
}

function getSortValue<TData>(row: TData, column: DataTableColumn<TData>) {
  if (column.sortValue) return column.sortValue(row)
  if (column.accessorKey === undefined) return null
  return row[column.accessorKey]
}

function compareValues(left: unknown, right: unknown) {
  if (left === right) return 0
  if (left === null || left === undefined) return 1
  if (right === null || right === undefined) return -1
  if (typeof left === 'number' && typeof right === 'number') return left - right

  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' })
}
