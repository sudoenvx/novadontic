import { Card, CardHeader, CardTitle } from '../../../../shared/ui/Card'
import { Field, FieldContent, FieldLabel } from '../../../../shared/ui/Field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../shared/ui/Select'
import type { Appliance } from '../../../appliances/domain/appliance'
import { getCaseCategoriesForAppliance } from '../../domain/caseCategory'
import type { CreateCaseValueUpdater, CreateCaseValues } from './createCase.types'
import type { WorkflowTemplate } from '../../../appliance-workflow-templates/domain/workflowTemplate'

type CreateCaseSetupFieldsProps = {
  values: CreateCaseValues
  appliances: Appliance[]
  categories: ReturnType<typeof getCaseCategoriesForAppliance>
  workflows: WorkflowTemplate[]
  onApplianceChange: (applianceId: string) => void
  onCategoryChange: (categoryId: string) => void
  onUpdateValue: CreateCaseValueUpdater
}

export function CreateCaseSetupFields({
  values,
  appliances,
  categories,
  workflows,
  onApplianceChange,
  onCategoryChange,
  onUpdateValue,
}: CreateCaseSetupFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Case setup</CardTitle>
        <p className="text-sm text-text-muted">
          Choose the appliance, category, and workflow that will control production.
        </p>
      </CardHeader>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="case-appliance">
            Appliance type <span aria-hidden="true" className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Select
              items={appliances.map((item) => ({ value: item.id, label: item.name }))}
              value={values.applianceId}
              onValueChange={(value) => onApplianceChange(value ?? '')}
            >
              <SelectTrigger id="case-appliance" className="w-full">
                <SelectValue placeholder="Select appliance" />
              </SelectTrigger>
              <SelectContent>
                {appliances.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="case-category">
            Case category <span aria-hidden="true" className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Select
              items={categories.map((item) => ({ value: item.id, label: item.name }))}
              value={values.categoryId}
              onValueChange={(value) => onCategoryChange(value ?? '')}
            >
              <SelectTrigger id="case-category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categories.find((item) => item.id === values.categoryId)?.description && (
              <p className="text-xs text-text-muted">
                {categories.find((item) => item.id === values.categoryId)?.description}
              </p>
            )}
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="case-workflow">
            Workflow template <span aria-hidden="true" className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Select
              items={workflows.map((workflow) => ({
                value: workflow.id,
                label: `${workflow.name}${workflow.isDefault ? ' · Default' : ''}`,
              }))}
              value={values.workflowTemplateId}
              onValueChange={(value) => onUpdateValue('workflowTemplateId', value ?? '')}
            >
              <SelectTrigger id="case-workflow" className="w-full">
                <SelectValue placeholder="Select workflow" />
              </SelectTrigger>
              <SelectContent>
                {workflows.map((workflow) => (
                  <SelectItem key={workflow.id} value={workflow.id}>
                    {workflow.name}{workflow.isDefault ? ' · Default' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
      </div>
    </Card>
  )
}
