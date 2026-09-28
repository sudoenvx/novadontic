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
        <TableHead className="w-10 px-3 text-center align-middle">
          <Checkbox
            checked={allRowsSelected}
            indeterminate={someRowsSelected}
            onCheckedChange={onToggleAll}
            aria-label="Select all rows"
          />
        </TableHead>
      )}
      {columns.map((column) => (
        <TableHead
          key={column.id}
          className={cn('py-2 text-start text-xs font-bold text-text-secondary', column.headerClassName ?? '')}
        >
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
      className={cn(
        'group inline-flex items-center gap-1 text-start text-inherit transition-colors duration-(--duration-fast)',
        isActive ? 'text-text-primary' : 'hover:text-text-primary',
      )}
      onClick={() => onSortChange({ columnId: column.id, direction: nextDirection })}
      aria-label={`Sort by ${column.id}`}
    >
      <span>{column.header}</span>
      {isActive ? (
        sortState.direction === 'asc' ? (
          <ArrowUp size={12} aria-hidden="true" className="text-primary" />
        ) : (
          <ArrowDown size={12} aria-hidden="true" className="text-primary" />
        )
      ) : (
        <ArrowUpDown
          size={12}
          aria-hidden="true"
          className="text-text-secondary opacity-50 transition-[color,opacity] duration-(--duration-fast) group-hover:text-text-primary group-hover:opacity-100"
        />
      )}
    </button>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
