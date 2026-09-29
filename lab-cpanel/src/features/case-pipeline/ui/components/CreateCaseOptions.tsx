import { Badge } from '../../../../shared/ui/Badge'
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
import { getCaseBillingRuleLabel, getCaseCategoriesForAppliance } from '../../domain/caseCategory'
import type { CasePipelinePriority } from '../../domain/casePipeline'
import type { CreateCaseValueUpdater, CreateCaseValues } from './createCase.types'

type CreateCaseOptionsProps = {
  values: CreateCaseValues
  applianceName: string
  category?: ReturnType<typeof getCaseCategoriesForAppliance>[number]
  onUpdateValue: CreateCaseValueUpdater
}

export function CreateCaseOptions({ values, applianceName, category, onUpdateValue }: CreateCaseOptionsProps) {
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
            <FieldLabel htmlFor="case-turnaround-days">Turnaround days (optional)</FieldLabel>
            <FieldContent>
              <Input
                id="case-turnaround-days"
                type="number"
                min={0}
                value={values.turnaroundDays ?? ''}
                onChange={(event) =>
                  onUpdateValue(
                    'turnaroundDays',
                    event.currentTarget.value === ''
                      ? undefined
                      : Math.max(0, Number(event.currentTarget.value)),
                  )
                }
                placeholder="7"
              />
              <p className="text-xs text-text-muted">
                Defaults to your lab setting when left unchanged.
              </p>
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

      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Selected setup details</CardTitle>
        </CardHeader>
        <div className="grid gap-2.5 text-xs">
          <div className="rounded-sm border border-border bg-neutral-50 p-2.5">
            <div className="mb-1 flex items-center justify-between gap-1">
              <span className="font-semibold text-text">{applianceName}</span>
              <Badge tone="info">Appliance</Badge>
            </div>
            <p className="text-2xs leading-relaxed text-text-muted">
              {values.applianceId === 'aligner'
                ? 'Sequential clear aligners engineered for orthodontic tooth movement and staged progress tracking.'
                : values.applianceId === 'retainer'
                  ? 'Post-treatment retention appliance with arch specification, material selection, and total set controls.'
                  : 'Standard dental appliance with customized fabrication steps according to selected template.'}
            </p>
          </div>
          {category && (
            <div className="rounded-sm border border-border bg-neutral-50 p-2.5">
              <div className="mb-1 flex items-center justify-between gap-1">
                <span className="font-semibold text-text">{category.name}</span>
                <Badge tone={category.requiresOriginalCase ? 'accent' : 'neutral'}>
                  {category.requiresOriginalCase ? 'Linked revision' : 'Standard'}
                </Badge>
              </div>
              <p className="mb-2 text-2xs leading-relaxed text-text-muted">{category.description}</p>
              <div className="grid grid-cols-2 gap-1.5 border-t border-border-soft pt-1.5 text-2xs">
                <div>
                  <span className="text-text-muted">Billing: </span>
                  <span className="font-medium text-text">
                    {category.defaultBillable
                      ? getCaseBillingRuleLabel(category.defaultPriceRule)
                      : 'Warranty (No charge)'}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Original case: </span>
                  <span className="font-medium text-text">
                    {category.requiresOriginalCase ? 'Required' : 'None'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </aside>
  )
}
