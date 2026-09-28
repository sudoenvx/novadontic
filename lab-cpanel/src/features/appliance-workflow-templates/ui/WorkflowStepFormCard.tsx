import { useState, type FormEvent } from 'react'

import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/Select'
import { Switch } from '../../../shared/ui/Switch'
import { Textarea } from '../../../shared/ui/Textarea'
import type { WorkflowStep, WorkflowStepKind } from '../domain/workflowTemplate'

type WorkflowStepFormCardProps = {
  step?: WorkflowStep
  onSave: (step: WorkflowStep) => void
  onCancel: () => void
}

export function WorkflowStepFormCard({ step, onSave, onCancel }: WorkflowStepFormCardProps) {
  const [name, setName] = useState(step?.name ?? '')
  const [description, setDescription] = useState(step?.description ?? '')
  const [kind, setKind] = useState<WorkflowStepKind>(step?.kind ?? 'production')
  const [estimatedDays, setEstimatedDays] = useState(String(step?.estimatedDays ?? 1))
  const [requiresApproval, setRequiresApproval] = useState(step?.requiresApproval ?? false)
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const duration = Number(estimatedDays)
    if (!name.trim() || !Number.isFinite(duration) || duration < 1) {
      setError('Add a step name and a duration of at least one day.')
      return
    }
    onSave({
      id: step?.id ?? `workflow-step-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      kind,
      estimatedDays: duration,
      requiresApproval,
    })
  }

  return (
    <Card className="gap-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{step ? 'Edit step' : 'New step'}</p>
          <h2 className="mt-1 text-base font-semibold text-text">Define the next production stage</h2>
        </div>
        <Button type="button" variant="neutral" onClick={onCancel}>Cancel</Button>
      </div>
      <form className="grid gap-2" onSubmit={handleSubmit}>
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="Step name" htmlFor="workflow-step-name">
            <Input id="workflow-step-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Printing" autoFocus />
          </Field>
          <Field label="Step type">
            <Select
              items={{ production: 'Production', quality: 'Quality check', shipping: 'Shipping' }}
              value={kind}
              onValueChange={(value) => setKind((value ?? 'production') as WorkflowStepKind)}
            >
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="quality">Quality check</SelectItem>
                <SelectItem value="shipping">Shipping</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Description" htmlFor="workflow-step-description" hint="Optional instruction for the team">
          <Textarea id="workflow-step-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What should happen during this step?" />
        </Field>
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="Expected duration" htmlFor="workflow-step-duration" hint="Days">
            <Input id="workflow-step-duration" type="number" min={1} value={estimatedDays} onChange={(event) => setEstimatedDays(event.target.value)} />
          </Field>
          <label className="flex items-end gap-2 pb-1 text-sm font-medium text-text">
            <Switch checked={requiresApproval} onCheckedChange={setRequiresApproval} aria-label="Approval required" />
            Approval required before next step
          </label>
        </div>
        {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="neutral" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{step ? 'Save changes' : 'Add step'}</Button>
        </div>
      </form>
    </Card>
  )
}

function Field({ children, hint, htmlFor, label }: { children: React.ReactNode; hint?: string; htmlFor?: string; label: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <span className="text-2xs text-text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  )
}
