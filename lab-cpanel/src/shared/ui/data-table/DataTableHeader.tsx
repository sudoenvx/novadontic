import { ArrowDown, ArrowUp, ArrowUpDown, Pin, PinOff } from 'lucide-react'
import { cn } from 'cn'

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
            'sticky top-0 z-20 w-10 border-b border-border-soft px-3 text-center bg-neutral-50 align-middle',
            hasPinnedColumns && 'left-0 z-40 bg-neutral-50',
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
            'sticky top-0 z-20 bg-neutral-50 py-1 text-start text-xs font-bold text-text-secondary border-b border-border-soft',
            column.headerClassName,
            pinnedColumns.has(column.id) && 'z-30 shadow-[1px_0_0_var(--border)]',
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
  const isActive = sortState?.columnId === column.id
  const nextDirection = isActive && sortState.direction === 'asc' ? 'desc' : 'asc'

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="min-w-0 truncate uppercase">{column.header}</span>
      <div className="flex shrink-0 items-center gap-0">
        {column.sortable === true && (
          <button
            type="button"
            className={cn(
              'grid size-6 place-items-center rounded-xs text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary',
              isActive && 'text-primary',
            )}
            onClick={() => onSortChange({ columnId: column.id, direction: nextDirection })}
            aria-label={`Sort by ${column.id}`}
            title={`Sort by ${column.id}`}
          >
            {isActive ? (
              sortState?.direction === 'asc' ? (
                <ArrowUp size={12} aria-hidden="true" />
              ) : (
                <ArrowDown size={12} aria-hidden="true" />
              )
            ) : (
              <ArrowUpDown size={12} aria-hidden="true" />
            )}
          </button>
        )}
        {column.pinnable === true && (
          <button
            type="button"
            className={cn(
              'grid size-6 place-items-center rounded-xs text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary',
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
    </div>
  )
}
