import { Clock3, MessageSquareText } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../../shared/ui/Button'
import { Card, CardHeader, CardTitle } from '../../../../shared/ui/Card'
import { Skeleton } from '../../../../shared/ui/Skeleton'
import { Textarea } from '../../../../shared/ui/Textarea'
import type { CaseActivityItem } from '../../domain/casePipeline'

type CasePipelineActivityProps = {
  activities: CaseActivityItem[]
  isLoading: boolean
  error?: string
  isSubmitting: boolean
  canAddNote: boolean
  onAddNote: (message: string) => Promise<boolean>
}

export function CasePipelineActivity({
  activities,
  isLoading,
  error,
  isSubmitting,
  canAddNote,
  onAddNote,
}: CasePipelineActivityProps) {
  const [note, setNote] = useState('')

  async function handleAddNote() {
    const normalizedNote = note.trim()
    if (!normalizedNote || isSubmitting) return
    if (await onAddNote(normalizedNote)) setNote('')
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <p className="text-sm text-text-muted">
          Case events and team notes, in chronological order.
        </p>
      </CardHeader>
      {error ? (
        <p role="alert" className="px-3 py-6 text-sm text-destructive">{error}</p>
      ) : (
        <ol
          aria-label="Case activity timeline"
          aria-busy={isLoading}
          className="relative grid gap-5 px-3 pb-4"
        >
          {isLoading ? (
            Array.from({ length: 3 }, (_, index) => (
              <li key={index} className="flex gap-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="grid flex-1 gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </li>
            ))
          ) : activities.length ? (
            activities.map((activity) => (
              <li key={activity.id} className="relative flex gap-3">
                <span
                  aria-hidden="true"
                  className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                    activity.isSystem
                      ? 'bg-surface-muted text-text-secondary'
                      : 'bg-accent text-accent-foreground'
                  }`}
                >
                  {activity.isSystem
                    ? <Clock3 className="size-4" />
                    : activity.initials || <MessageSquareText className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-semibold text-text-primary">{activity.author}</span>
                    <time
                      className="text-xs text-text-muted"
                      dateTime={activity.createdAt}
                    >
                      {formatActivityDate(activity.createdAt)}
                    </time>
                  </div>
                  <p className={`mt-1 whitespace-pre-wrap text-sm leading-relaxed ${
                    activity.isSystem
                      ? 'text-text-secondary'
                      : 'rounded-md bg-surface-muted px-3 py-2 text-text-primary'
                  }`}>
                    {activity.message}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li className="py-7 text-center text-sm text-text-muted">
              No activity has been recorded for this case yet.
            </li>
          )}
        </ol>
      )}
      {canAddNote && (
        <div className="border-t border-border-subtle px-3 py-4">
          <label htmlFor="case-activity-note" className="mb-2 block text-sm font-semibold text-text-primary">
            Add a note
          </label>
          <Textarea
            id="case-activity-note"
            value={note}
            onChange={(event) => setNote(event.currentTarget.value)}
            placeholder="Add a note for the team or doctor..."
            maxLength={10_000}
            rows={3}
            disabled={isSubmitting}
          />
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              onClick={() => void handleAddNote()}
              disabled={!note.trim() || isSubmitting}
            >
              {isSubmitting ? 'Adding note…' : 'Add note'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

function formatActivityDate(value: string) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
