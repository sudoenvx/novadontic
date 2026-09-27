type BrandProps = {
  context?: string
  onClick?: () => void
}

export function Brand({ context, onClick }: BrandProps) {
  const content = (
    <>
      <img className="h-7 object-contain" src="/images/novadontic_wordmark.png" alt="" />
      {context && <span className="truncate bg-neutral-200 px-2 py-0.5 text-sm text-text-muted max-sm:hidden">{context}</span>}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        className="flex min-w-0 items-center gap-2 text-left text-brand-ink"
        onClick={onClick}
        aria-label="Go to dashboard home"
      >
        {content}
      </button>
    )
  }

  return <div className="flex min-w-0 items-center gap-2 text-brand-ink">{content}</div>
}
