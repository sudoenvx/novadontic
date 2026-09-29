import { ArrowDown, ArrowUp, ArrowUpDown, Pin, PinOff } from 'lucide-react'

import { Checkbox } from '../Checkbox'
import { TableHead, TableRow } from '../Table'
import type { DataTableColumn, DataTableSortState } from './types'

type DataTableHeaderProps<TData> = {
  columns: DataTableColumn<TData>[]
  selectable: boolean
  allRowsSelected: boolean
  someRowsSelected: boolean
  sortState?: DataTableSortState
  pinnedColumns: Set<string>
  hasPinnedColumns: boolean
  onTogglePinnedColumn: (columnId: string) => void
  onSortChange: (state: DataTableSortState | undefined) => void
  onToggleAll: () => void
}

export function DataTableHeader<TData>({
  allRowsSelected,
  columns,
  hasPinnedColumns,
  pinnedColumns,
  onSortChange,
  onTogglePinnedColumn,
  onToggleAll,
  selectable,
  someRowsSelected,
  sortState,
}: DataTableHeaderProps<TData>) {
  return (
    <TableRow>
      {selectable && (
        <TableHead
          className={cn(
            'w-10 px-3 text-center align-middle',
            hasPinnedColumns && 'sticky left-0 z-30 bg-surface-muted',
          )}
          style={hasPinnedColumns ? { left: 0 } : undefined}
        >
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
          data-column-id={column.id}
          data-pinned={pinnedColumns.has(column.id) || undefined}
          className={cn(
            'py-2 text-start text-xs font-bold text-text-secondary',
            column.headerClassName,
            pinnedColumns.has(column.id) && 'sticky z-20 bg-surface-muted shadow-[1px_0_0_var(--border)]',
          )}
        >
          <HeaderContent
            column={column}
            isPinned={pinnedColumns.has(column.id)}
            onTogglePinned={() => onTogglePinnedColumn(column.id)}
            sortState={sortState}
            onSortChange={onSortChange}
          />
        </TableHead>
      ))}
    </TableRow>
  )
}

function HeaderContent<TData>({
  column,
  isPinned,
  onTogglePinned,
  onSortChange,
  sortState,
}: {
  column: DataTableColumn<TData>
  isPinned: boolean
  onTogglePinned: () => void
  onSortChange: (state: DataTableSortState | undefined) => void
  sortState?: DataTableSortState
}) {
  const isSortable = column.sortable === true
  const isActive = sortState?.columnId === column.id
  const nextDirection = isActive && sortState.direction === 'asc' ? 'desc' : 'asc'

  return (
    <div className="flex min-w-0 items-center gap-2">
      {isSortable ? (
        <button
          type="button"
          className={cn(
            'group/sort-header inline-flex min-w-0 flex-1 items-center gap-1 text-start text-inherit transition-colors duration-(--duration-fast)',
            isActive ? 'text-text-primary' : 'hover:text-text-primary',
          )}
          onClick={() => onSortChange({ columnId: column.id, direction: nextDirection })}
          aria-label={`Sort by ${column.id}`}
        >
          <span className="truncate">{column.header}</span>
          {isActive ? (
            sortState?.direction === 'asc' ? (
              <ArrowUp size={12} aria-hidden="true" className="text-primary" />
            ) : (
              <ArrowDown size={12} aria-hidden="true" className="text-primary" />
            )
          ) : (
            <ArrowUpDown
              size={12}
              aria-hidden="true"
              className="text-text-secondary opacity-50 transition-[color,opacity] duration-(--duration-fast) group-hover/sort-header:text-text-primary group-hover/sort-header:opacity-100"
            />
          )}
        </button>
      ) : (
        <span className="min-w-0 flex-1 truncate">{column.header}</span>
      )}
      {column.pinnable === true && (
        <button
          type="button"
          className={cn(
            'grid size-6 shrink-0 place-items-center rounded-xs text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary',
            isPinned && 'bg-primary-soft text-primary-soft-foreground',
          )}
          onClick={onTogglePinned}
          aria-label={`${isPinned ? 'Unpin' : 'Pin'} ${column.id} column`}
          aria-pressed={isPinned}
          title={`${isPinned ? 'Unpin' : 'Pin'} column`}
        >
          {isPinned ? <PinOff size={13} aria-hidden="true" /> : <Pin size={13} aria-hidden="true" />}
        </button>
      )}
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
