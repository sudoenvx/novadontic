export type WorkflowStepKind = 'production' | 'quality' | 'shipping'

export type WorkflowStep = {
  id: string
  name: string
  description?: string
  kind: WorkflowStepKind
  estimatedDays: number
  requiresApproval: boolean
}

export type WorkflowTemplate = {
  id: string
  applianceId: string
  name: string
  isDefault: boolean
  isActive: boolean
  steps: WorkflowStep[]
}

export function getWorkflowDuration(workflow: WorkflowTemplate) {
  return workflow.steps.reduce((total, step) => total + step.estimatedDays, 0)
}

export function getWorkflowStepCount(workflow: WorkflowTemplate) {
  return workflow.steps.length
}

export function getWorkflowKindLabel(kind: WorkflowStepKind) {
  return kind === 'quality' ? 'Quality' : kind === 'shipping' ? 'Shipping' : 'Production'
}

export function getNextStepName(workflow: WorkflowTemplate) {
  return `Step ${workflow.steps.length + 1}`
}

export function moveWorkflowStep(
  steps: WorkflowStep[],
  fromIndex: number,
  targetIndex: number,
) {
  if (
    fromIndex < 0 ||
    fromIndex >= steps.length ||
    targetIndex < 0 ||
    targetIndex > steps.length ||
    fromIndex === targetIndex
  ) {
    return steps
  }

  const nextSteps = [...steps]
  const [step] = nextSteps.splice(fromIndex, 1)
  const insertionIndex = fromIndex < targetIndex ? targetIndex - 1 : targetIndex

  nextSteps.splice(insertionIndex, 0, step)
  return nextSteps
}
