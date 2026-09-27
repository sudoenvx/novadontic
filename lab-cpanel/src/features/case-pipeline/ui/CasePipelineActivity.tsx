import { Clock3 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../shared/ui/Button'
import { Card, CardHeader, CardTitle } from '../../../shared/ui/Card'
import { Textarea } from '../../../shared/ui/Textarea'
import type { CaseActivityItem } from '../domain/casePipeline'

export function CasePipelineActivity({
  activities,
  onAddNote,
}: {
  activities: CaseActivityItem[]
  onAddNote: (message: string) => void
}) {
  const [note, setNote] = useState('')

  function handleAddNote() {
    const normalizedNote = note.trim()

    if (!normalizedNote) {
      return
    }

    onAddNote(normalizedNote)
    setNote('')
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <div className="relative grid gap-4 pl-8">
        <span className="absolute top-2 bottom-14 left-3 w-px bg-border-subtle" aria-hidden="true" />
        {activities.map((activity) => (
          <div key={activity.id} className="relative">
            <span className={`absolute -left-8 grid size-6 place-items-center rounded-full ${activity.isSystem ? 'bg-surface-muted text-text-muted' : 'bg-accent text-accent-foreground'}`}>
              {activity.isSystem ? <Clock3 className="size-3" /> : activity.initials}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-text">{activity.author}</span>
              <span className="text-xs text-text-muted">{activity.createdAt}</span>
            </div>
            <p className="mt-1 inline-block rounded-sm bg-surface-muted px-2.5 py-1.5 text-sm text-secondary">{activity.message}</p>
          </div>
        ))}
        <div className="relative">
          <span className="absolute -left-8 grid size-6 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">AM</span>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.currentTarget.value)}
            placeholder="Add a note for the team or doctor..."
            rows={3}
          />
          <div className="mt-1.5 flex justify-end">
            <Button onClick={handleAddNote} disabled={!note.trim()}>Add note</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
