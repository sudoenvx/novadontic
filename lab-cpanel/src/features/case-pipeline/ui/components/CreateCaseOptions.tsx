import { Card, CardHeader, CardTitle } from '../../../../shared/ui/Card'
import { Field, FieldContent, FieldLabel } from '../../../../shared/ui/Field'
import { Input } from '../../../../shared/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../shared/ui/Select'
import type { CasePipelinePriority } from '../../domain/casePipeline'
import type { CreateCaseValueUpdater, CreateCaseValues } from './createCase.types'

type CreateCaseOptionsProps = {
  values: CreateCaseValues
  onUpdateValue: CreateCaseValueUpdater
}

export function CreateCaseOptions({ values, onUpdateValue }: CreateCaseOptionsProps) {
  return (
    <aside className="grid content-start gap-3">
      <Card className="xl:sticky xl:top-[calc(var(--navbar-height)+var(--page-gap))]">
        <CardHeader>
          <CardTitle>Case options</CardTitle>
          <p className="text-sm text-text-muted">
            Set timing and billing before sending the case into production.
          </p>
        </CardHeader>
        <div className="grid gap-3">
          <Field>
            <FieldLabel htmlFor="case-due-date">Due date</FieldLabel>
            <FieldContent>
              <Input
                id="case-due-date"
                type="date"
                value={values.dueDate ?? ''}
                onChange={(event) =>
                  onUpdateValue('dueDate', event.currentTarget.value || undefined)
                }
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="case-priority">Priority</FieldLabel>
            <FieldContent>
              <Select
                items={[
                  { value: 'Normal', label: 'Normal' },
                  { value: 'Rush', label: 'Rush' },
                ]}
                value={values.priority}
                onValueChange={(value) =>
                  onUpdateValue('priority', (value ?? 'Normal') as CasePipelinePriority)
                }
              >
                <SelectTrigger id="case-priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Rush">Rush</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </div>
      </Card>
    </aside>
  )
}
