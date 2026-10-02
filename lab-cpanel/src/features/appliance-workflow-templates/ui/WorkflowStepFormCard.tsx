import { useState, type FormEvent } from 'react'

import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import { Switch } from '../../../shared/ui/Switch'
import type {
  WorkflowFileKind,
  WorkflowStageInput,
  WorkflowStep,
} from '../domain/workflowTemplate'

const fileKinds: WorkflowFileKind[] = ['stl', 'photo', 'pdf', 'doc']

type WorkflowStepFormCardProps = {
  step?: WorkflowStep
  onSave: (step: WorkflowStageInput) => void
  onCancel: () => void
}

export function WorkflowStepFormCard({
  step,
  onSave,
  onCancel,
}: WorkflowStepFormCardProps) {
  const [name, setName] = useState(step?.name ?? '')
  const [slaHours, setSlaHours] = useState(
    step?.slaHours === null || step?.slaHours === undefined
      ? ''
      : String(step.slaHours),
  )
  const [requiresApproval, setRequiresApproval] = useState(
    step?.requiresApproval ?? false,
  )
  const [allowedFileKinds, setAllowedFileKinds] = useState<WorkflowFileKind[]>(
    step?.allowedFileKinds ?? fileKinds,
  )
  const [error, setError] = useState('')

  function toggleFileKind(fileKind: WorkflowFileKind) {
    setAllowedFileKinds((current) =>
      current.includes(fileKind)
        ? current.filter((item) => item !== fileKind)
        : [...current, fileKind],
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const duration = slaHours === '' ? null : Number(slaHours)
    if (
      !name.trim() ||
      (duration !== null &&
        (!Number.isInteger(duration) || duration < 1)) ||
      allowedFileKinds.length === 0
    ) {
      setError('Enter a step name, a valid SLA, and at least one allowed file type.')
      return
    }
    onSave({
      name: name.trim(),
      slaHours: duration,
      requiresApproval,
      allowedFileKinds,
    })
  }

  return (
    <Card className="gap-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {step ? 'Edit step' : 'New step'}
          </p>
          <h2 className="mt-1 text-base font-semibold text-text">
            Define the next production stage
          </h2>
        </div>
        <Button type="button" variant="neutral" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <form className="grid gap-2" onSubmit={handleSubmit}>
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="Step name" htmlFor="workflow-step-name">
            <Input
              id="workflow-step-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Printing"
              autoFocus
            />
          </Field>
          <Field label="Service-level agreement" htmlFor="workflow-step-sla" hint="Hours">
            <Input
              id="workflow-step-sla"
              type="number"
              min={1}
              step={1}
              value={slaHours}
              onChange={(event) => setSlaHours(event.target.value)}
              placeholder="No SLA"
            />
          </Field>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <fieldset className="flex flex-wrap gap-x-3 gap-y-2">
            <legend className="mb-1 text-sm font-medium text-text">
              Allowed file types
            </legend>
            {fileKinds.map((fileKind) => (
              <label key={fileKind} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={allowedFileKinds.includes(fileKind)}
                  onChange={() => toggleFileKind(fileKind)}
                />
                {fileKind.toUpperCase()}
              </label>
            ))}
          </fieldset>
          <label className="flex items-center gap-2 text-sm font-medium text-text">
            <Switch
              checked={requiresApproval}
              onCheckedChange={setRequiresApproval}
              aria-label="Approval required"
            />
            Approval required before next step
          </label>
        </div>
        {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{step ? 'Save changes' : 'Add step'}</Button>
        </div>
      </form>
    </Card>
  )
}

function Field({
  children,
  hint,
  htmlFor,
  label,
}: {
  children: React.ReactNode
  hint?: string
  htmlFor?: string
  label: string
}) {
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
