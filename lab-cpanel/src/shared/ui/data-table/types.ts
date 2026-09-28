import type { ReactNode } from 'react'

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
  className?: string
  headerClassName?: string
}

export type DataTableProps<TData> = {
  children?: ReactNode
  columns: DataTableColumn<TData>[]
  data: TData[]
  title?: ReactNode
  description?: ReactNode
  pagination?: ReactNode
  emptyMessage?: ReactNode
  loading?: boolean
  loadingRowCount?: number
  getRowId?: (row: TData, index: number) => string | number
  onRowClick?: (row: TData) => void
  selectable?: boolean
  selectedRowIds?: Array<string | number>
  defaultSelectedRowIds?: Array<string | number>
  onSelectionChange?: (rows: TData[]) => void
  className?: string
}
