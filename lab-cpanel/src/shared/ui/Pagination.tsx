import { Button } from './Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from 'cn'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select'

export type PaginationProps = {
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange?: (perPage: number) => void
  pageSizeOptions?: number[]
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  perPage,
  onPerPageChange,
  pageSizeOptions = [8, 16, 32, 64],
}: PaginationProps) {
  const itemCount = Math.max(0, totalItems)
  const pageSize = Math.max(1, perPage)
  const pageCount = Math.max(1, totalPages)
  const page = Math.min(Math.max(1, currentPage), pageCount)
  const startItem = itemCount === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, itemCount)
  const pages = buildPageSequence(page, pageCount)
  const availablePageSizes = Array.from(new Set([...pageSizeOptions, pageSize]))
    .filter((value) => Number.isInteger(value) && value > 0)
    .sort((left, right) => left - right)

  return (
    <nav
      aria-label="Pagination"
      className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3"
    >
      <p className="text-xs text-text-secondary tabular">
        {itemCount === 0 ? 'No results' : `Showing ${startItem}–${endItem} of ${itemCount}`}
      </p>
      <div dir="ltr" className="ms-auto flex flex-wrap items-center justify-end gap-1">
        {onPerPageChange && (
          <label className="me-1 flex items-center gap-1.5 text-xs text-text-secondary">
            <span>Rows</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                if (value !== null) onPerPageChange(Number(value))
              }}
            >
              <SelectTrigger
                size="xs"
                className="w-16 gap-1 px-2 text-xs"
                aria-label="Rows per page"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {availablePageSizes.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}
        <Button
          type="button"
          variant="neutral"
          size="icon-xs"
          className="bg-neutral-50 hover:bg-neutral-100 aria-expanded:bg-neutral-100"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        {pages.map((pageNumber, index) => pageNumber === '…' ? (
          <span key={`ellipsis-${index}`} aria-hidden="true" className="px-1 text-xs text-text-faint">…</span>
        ) : (
          <Button
            key={pageNumber}
            type="button"
            variant="neutral"
            size="icon-xs"
            className={cn(
              'bg-neutral-50 hover:bg-neutral-100 aria-expanded:bg-neutral-100',
              pageNumber === page && 'border-border-strong font-bold',
            )}
            aria-label={`Page ${pageNumber}`}
            aria-current={pageNumber === page ? 'page' : undefined}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          type="button"
          variant="neutral"
          size="icon-xs"
          className="bg-neutral-50 hover:bg-neutral-100 aria-expanded:bg-neutral-100"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}

function buildPageSequence(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)

  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let index = Math.max(2, current - 1); index <= Math.min(total - 1, current + 1); index++) {
    pages.push(index)
  }
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}
