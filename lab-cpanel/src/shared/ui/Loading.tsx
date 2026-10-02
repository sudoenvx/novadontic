import { Skeleton } from './Skeleton'

type LoadingProps = {
  label: string
}

export function PageLoading({ label }: LoadingProps) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className="grid gap-3"
    >
      <div className="grid gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-3 rounded-lg border border-border-subtle bg-surface p-4 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-2">
          <Skeleton className="h-5 w-56 max-w-full" />
          <Skeleton className="h-4 w-40 max-w-full" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid gap-4 rounded-lg border border-border-subtle bg-surface p-4">
        <div className="grid gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-52 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="grid gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full max-w-48" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function FormLoading({ label }: LoadingProps) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className="grid gap-4 sm:grid-cols-2"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="grid gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

export function FieldLoading({ label }: LoadingProps) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className="grid"
    >
      <Skeleton className="h-9 w-full" />
    </div>
  )
}
