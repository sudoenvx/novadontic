import { cn } from 'cn'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

interface PaginationProps {
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
}: PaginationProps) {
  const pages = buildPageSequence(currentPage, totalPages)

  return (
    <div dir="ltr" className="flex items-center justify-between">
      {/* <span className="text-[12px] text-text-muted">
        showing {start} – { end} of {totalItems} records
      </span> */}

      <div className="flex items-center gap-1">
        {/* "السابق" (previous) visually points toward the start of reading (right) in RTL */}
        <PgBtn
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="الصفحة السابقة"
        >
          <ChevronLeft size={13} />
        </PgBtn>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`dots-${i}`} className="text-[12px] text-text-muted px-1">…</span>
          ) : (
            <PgBtn
              key={p}
              active={p === currentPage}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </PgBtn>
          )
        )}

        {/* "التالي" (next) visually points toward the end of reading (left) in RTL */}
        <PgBtn
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="الصفحة التالية"
        >
          <ChevronRight size={13} />
        </PgBtn>
      </div>
    </div>
  )
}

function PgBtn({
  children, onClick, disabled, active, title,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'min-w-6 h-6 px-1.5 rounded-xs text-[11px] font-medium tabular-nums',
        'transition-colors flex items-center justify-center font-inter',
        active
          ? 'bg-primary border-primary text-primary-text'
          : 'bg-secondary/20  text-text hover:bg-secondary/20 hover:text-text hover:border-border-strong',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
      )}
    >
      {children}
    </button>
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
