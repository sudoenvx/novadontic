import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { Checkbox } from '../Checkbox'
import { TableHead, TableRow } from '../Table'
import type { DataTableColumn, DataTableSortState } from './types'

type DataTableHeaderProps<TData> = {
  columns: DataTableColumn<TData>[]
  selectable: boolean
  allRowsSelected: boolean
  someRowsSelected: boolean
  sortState?: DataTableSortState
  onSortChange: (state: DataTableSortState | undefined) => void
  onToggleAll: () => void
}

export function DataTableHeader<TData>({
  allRowsSelected,
  columns,
  onSortChange,
  onToggleAll,
  selectable,
  someRowsSelected,
  sortState,
}: DataTableHeaderProps<TData>) {
  return (
    <TableRow>
      {selectable && (
        <TableHead className="w-10 px-2 text-center align-middle">
          <Checkbox
            checked={allRowsSelected}
            indeterminate={someRowsSelected}
            onCheckedChange={onToggleAll}
            aria-label="Select all rows"
          />
        </TableHead>
      )}
      {columns.map((column) => (
        <TableHead key={column.id} className={`py-1.5 text-start text-text-muted text-sm uppercase ${column.headerClassName ?? ''}`}>
          <SortableHeader column={column} sortState={sortState} onSortChange={onSortChange} />
        </TableHead>
      ))}
    </TableRow>
  )
}

function SortableHeader<TData>({
  column,
  onSortChange,
  sortState,
}: {
  column: DataTableColumn<TData>
  onSortChange: (state: DataTableSortState | undefined) => void
  sortState?: DataTableSortState
}) {
  const isSortable = column.sortable ?? (column.accessorKey !== undefined || column.sortValue !== undefined)
  if (!isSortable) return column.header

  const isActive = sortState?.columnId === column.id
  const nextDirection = isActive && sortState.direction === 'asc' ? 'desc' : 'asc'

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-start text-inherit"
      onClick={() => onSortChange({ columnId: column.id, direction: nextDirection })}
      aria-label={`Sort by ${column.id}`}
    >
      <span>{column.header}</span>
      {isActive ? (
        sortState.direction === 'asc' ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />
      ) : (
        <ArrowUpDown size={13} aria-hidden="true" />
      )}
    </button>
  )
}
