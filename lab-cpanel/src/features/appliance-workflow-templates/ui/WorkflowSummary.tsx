type WorkflowSummaryProps = {
  label: string
  value: string
}

export function WorkflowSummary({ label, value }: WorkflowSummaryProps) {
  return (
    <div className="min-w-0 rounded-sm border border-border bg-surface-soft px-3 py-2">
      <p className="text-lg font-semibold text-text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-muted">{label}</p>
    </div>
  )
}