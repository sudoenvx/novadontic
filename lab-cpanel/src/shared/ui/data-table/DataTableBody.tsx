import { TableBody, TableCell, TableRow } from '../Table'
import { Checkbox } from '../Checkbox'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useCallback, useRef, type ReactNode } from 'react'
import type { DataTableColumn } from './types'
import { getRowKey } from './useDataTable'

type DataTableBodyProps<TData> = {
  columns: DataTableColumn<TData>[]
  rows: TData[]
  emptyMessage: ReactNode
  getRowId?: (row: TData, index: number) => string | number
  onRowClick?: (row: TData) => void
  selectable: boolean
  selectedIds: Set<string>
  pinnedColumns: Set<string>
  hasPinnedColumns: boolean
  onToggleRow: (row: TData, index: number) => void
}

export function DataTableBody<TData>({
  columns,
  emptyMessage,
  getRowId,
  onRowClick,
  onToggleRow,
  rows,
  selectable,
  selectedIds,
  pinnedColumns,
  hasPinnedColumns,
}: DataTableBodyProps<TData>) {
  return (
    <TableBody>
      {rows.length > 0 ? (
        rows.map((row, index) => {
          const rowId = getRowKey(row, index, getRowId)

          return (
            <DataTableRow
              columns={columns}
              key={rowId}
              index={index}
              onRowClick={onRowClick}
              onToggleRow={onToggleRow}
              row={row}
              rowId={rowId}
              selectable={selectable}
              selected={selectedIds.has(rowId)}
              pinnedColumns={pinnedColumns}
              hasPinnedColumns={hasPinnedColumns}
            />
          )
        })
      ) : (
        <TableRow>
          <TableCell
            colSpan={columns.length + (selectable ? 1 : 0)}
            className="py-10 text-center text-sm text-text-muted"
          >
            {emptyMessage}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  )
}

type DataTableRowProps<TData> = {
  columns: DataTableColumn<TData>[]
  index: number
  onRowClick?: (row: TData) => void
  onToggleRow: (row: TData, index: number) => void
  row: TData
  rowId: string
  selectable: boolean
  selected: boolean
  pinnedColumns: Set<string>
  hasPinnedColumns: boolean
}

function DataTableRow<TData>({
  columns,
  index,
  onRowClick,
  onToggleRow,
  row,
  rowId,
  selectable,
  selected,
  pinnedColumns,
  hasPinnedColumns,
}: DataTableRowProps<TData>) {
  const rowRef = useRef<HTMLTableRowElement>(null)
  const handleRowClick = useCallback(() => onRowClick?.(row), [onRowClick, row])
  const activateRow = useCallback(
    (event: globalThis.KeyboardEvent) => {
      if (event.target !== event.currentTarget) return
      event.preventDefault()
      event.stopPropagation()
      onRowClick?.(row)
    },
    [onRowClick, row],
  )

  useHotkey('Enter', activateRow, {
    enabled: onRowClick !== undefined,
    preventDefault: false,
    stopPropagation: false,
    target: rowRef,
  })
  useHotkey('Space', activateRow, {
    enabled: onRowClick !== undefined,
    preventDefault: false,
    stopPropagation: false,
    target: rowRef,
  })

  return (
    <TableRow
      ref={rowRef}
      className={
        onRowClick
          ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset'
          : undefined
      }
      tabIndex={onRowClick ? 0 : undefined}
      onClick={onRowClick ? handleRowClick : undefined}
      aria-selected={selectable ? selected : undefined}
      data-selected={selected || undefined}
    >
      {selectable && (
        <TableCell
          className={cn(
            'w-10 px-3 text-center align-middle',
            hasPinnedColumns && 'sticky left-0 z-20 bg-surface group-hover:bg-surface-soft group-data-[selected=true]:bg-primary-soft',
          )}
          style={hasPinnedColumns ? { left: 0 } : undefined}
          onClick={(event) => event.stopPropagation()}
        >
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleRow(row, index)}
            aria-label={`Select row ${rowId}`}
          />
        </TableCell>
      )}
      {columns.map((column) => (
        <TableCell
          key={column.id}
          data-column-id={column.id}
          data-pinned={pinnedColumns.has(column.id) || undefined}
          className={cn(
            column.className,
            pinnedColumns.has(column.id) && 'sticky z-10 bg-surface shadow-[1px_0_0_var(--border)] group-hover:bg-surface-soft group-data-[selected=true]:bg-primary-soft',
          )}
        >
          {column.cell ? column.cell(row) : getCellValue(row, column)}
        </TableCell>
      ))}
    </TableRow>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

function getCellValue<TData>(row: TData, column: DataTableColumn<TData>) {
  if (column.accessorKey === undefined) return null

  const value = row[column.accessorKey]
  return value === null || value === undefined ? '—' : String(value)
}
