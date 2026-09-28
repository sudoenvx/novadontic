import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from './Button'

type PaginationProps = {
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  perPage,
}: PaginationProps) {
  const itemCount = Math.max(0, totalItems)
  const pageSize = Math.max(1, perPage)
  const pageCount = Math.max(0, totalPages)
  const page = Math.min(Math.max(1, currentPage), Math.max(1, pageCount))
  const startItem = itemCount === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, itemCount)
  const pages = buildPageSequence(page, pageCount)

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs text-text-secondary tabular">
        Showing {startItem}-{endItem} of {itemCount}
      </p>
      {pageCount > 0 && (
        <div dir="ltr" className="flex items-center gap-1">
          <Button
            type="button"
            variant="neutral"
            size="icon-sm"
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
              variant={pageNumber === page ? 'soft' : 'neutral'}
              size="icon-sm"
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
            size="icon-sm"
            aria-label="Next page"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      )}
    </nav>
  )
}

function buildPageSequence(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}
