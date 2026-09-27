import type { WorkflowStep, WorkflowStepKind, WorkflowTemplate } from '../domain/workflowTemplate'

export type WorkflowStepResponse = Omit<WorkflowStep, 'estimatedDays' | 'requiresApproval'> & {
  estimated_days: number
  requires_approval: boolean
}

export type WorkflowTemplateResponse = Omit<WorkflowTemplate, 'applianceId' | 'isDefault' | 'isActive' | 'steps'> & {
  appliance_id: string
  is_default: boolean
  is_active: boolean
  steps: WorkflowStepResponse[]
}

export function mapWorkflowTemplateResponse(response: WorkflowTemplateResponse): WorkflowTemplate {
  return {
    id: response.id,
    applianceId: response.appliance_id,
    name: response.name,
    isDefault: response.is_default,
    isActive: response.is_active,
    steps: response.steps.map((step) => ({
      id: step.id,
      name: step.name,
      description: step.description,
      kind: step.kind as WorkflowStepKind,
      estimatedDays: step.estimated_days,
      requiresApproval: step.requires_approval,
    })),
  }
}
