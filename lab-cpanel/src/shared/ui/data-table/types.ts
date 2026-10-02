import type { CSSProperties, ReactNode } from 'react'

export type DataTableSortDirection = 'asc' | 'desc'

export type DataTableSortState = {
  columnId: string
  direction: DataTableSortDirection
}

export type DataTableColumn<TData> = {
  id: string
  header: ReactNode
  accessorKey?: keyof TData
  cell?: (row: TData) => ReactNode
  sortable?: boolean
  sortValue?: (row: TData) => unknown
  pinnable?: boolean
  showInColumnVisualizer?: boolean
  className?: string
  headerClassName?: string
}

export type DataTableSelection<TData> = {
  selectedIds: Array<string | number>
  selectedRows: TData[]
  clearSelection: () => void
}

export type DataTableProps<TData> = {
  children?: ReactNode
  columns: DataTableColumn<TData>[]
  data: TData[]
  title?: ReactNode
  description?: ReactNode
  toolbar?: ReactNode
  bulkActions?: (selection: DataTableSelection<TData>) => ReactNode
  footer?: ReactNode
  emptyState?: ReactNode
  emptyMessage?: ReactNode
  bodyMaxHeight?: CSSProperties['maxHeight']
  loading?: boolean
  loadingRowCount?: number
  getRowId?: (row: TData, index: number) => string | number
  onRowClick?: (row: TData) => void
  selectable?: boolean
  compact?: boolean
  selectedRowIds?: Array<string | number>
  defaultSelectedRowIds?: Array<string | number>
  defaultPinnedColumnIds?: string[]
  persistenceKey?: string
  onSelectionChange?: (rows: TData[]) => void
  className?: string
}
