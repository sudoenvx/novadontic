import type { ComponentProps } from 'react'
import { Pagination } from '../Pagination'

export function DataTablePagination(props: ComponentProps<typeof Pagination>) {
  return <Pagination {...props} />
}
