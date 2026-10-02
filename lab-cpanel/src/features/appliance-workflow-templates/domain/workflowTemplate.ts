export type WorkflowFileKind = 'stl' | 'photo' | 'pdf' | 'doc'

export type WorkflowStep = {
  id: string
  name: string
  slaHours: number | null
  requiresApproval: boolean
  allowedFileKinds: WorkflowFileKind[]
}

export type WorkflowTemplate = {
  id: string
  applianceId: string | null
  name: string
  isDefault: boolean
  steps: WorkflowStep[]
}

export type WorkflowTemplateOption = {
  id: string
  applianceId: string | null
  name: string
  isDefault: boolean
}

export type WorkflowStageInput = Omit<WorkflowStep, 'id'>
export type WorkflowTemplateInput = {
  applianceTypeId: string | null
  name: string
  isDefault: boolean
}
export type WorkflowTemplateUpdateInput = Partial<WorkflowTemplateInput>

export function getWorkflowDuration(workflow: WorkflowTemplate) {
  const totalHours = workflow.steps.reduce(
    (total, step) => total + (step.slaHours ?? 0),
    0,
  )
  return Math.ceil(totalHours / 24)
}

export function getWorkflowStepCount(workflow: WorkflowTemplate) {
  return workflow.steps.length
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
