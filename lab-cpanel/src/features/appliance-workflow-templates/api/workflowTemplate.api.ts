import { httpClient } from '../../../shared/api/httpClient'
import type {
  WorkflowStageInput,
  WorkflowTemplateInput,
  WorkflowTemplateUpdateInput,
} from '../domain/workflowTemplate'
import {
  workflowStageInputDtoSchema,
  workflowStageListResponseEnvelopeDtoSchema,
  workflowStageResponseEnvelopeDtoSchema,
  workflowTemplateInputDtoSchema,
  workflowTemplateListResponseDtoSchema,
  workflowTemplateOptionListResponseDtoSchema,
  workflowTemplateResponseEnvelopeDtoSchema,
  workflowTemplateUpdateDtoSchema,
  type WorkflowStageResponseDto,
  type WorkflowTemplateResponseDto,
} from './workflowTemplate.dto'

export function mapWorkflowTemplateResponse(response: WorkflowTemplateResponseDto) {
  return {
    id: response.id,
    applianceId: response.applianceTypeId,
    name: response.name,
    isDefault: response.isDefault,
    steps: response.stages.map(mapWorkflowStageResponse),
  }
}

function mapWorkflowStageResponse(response: WorkflowStageResponseDto) {
  return {
    id: response.id,
    name: response.name,
    slaHours: response.slaHours,
    requiresApproval: response.requiresApproval,
    allowedFileKinds: response.allowedFileKinds,
  }
}

export async function getWorkflowTemplates() {
  const response = await httpClient.get('/workflows')
  const parsed = workflowTemplateListResponseDtoSchema.parse(response.data)
  return parsed.data.map(mapWorkflowTemplateResponse)
}

export async function getWorkflowTemplateOptions() {
  const response = await httpClient.get('/workflows')
  const parsed = workflowTemplateOptionListResponseDtoSchema.parse(response.data)
  return parsed.data.map((template) => ({
    id: template.id,
    applianceId: template.applianceTypeId,
    name: template.name,
    isDefault: template.isDefault,
  }))
}

export async function createWorkflowTemplate(input: WorkflowTemplateInput) {
  const payload = workflowTemplateInputDtoSchema.parse(input)
  const response = await httpClient.post('/workflows', payload)
  const parsed = workflowTemplateResponseEnvelopeDtoSchema.parse(response.data)
  return mapWorkflowTemplateResponse(parsed.data)
}

export async function updateWorkflowTemplate(
  workflowId: string,
  input: WorkflowTemplateUpdateInput,
) {
  const payload = workflowTemplateUpdateDtoSchema.parse(input)
  const response = await httpClient.patch(
    `/workflows/${encodeURIComponent(workflowId)}`,
    payload,
  )
  const parsed = workflowTemplateResponseEnvelopeDtoSchema.parse(response.data)
  return mapWorkflowTemplateResponse(parsed.data)
}

export async function createWorkflowStage(
  workflowId: string,
  input: WorkflowStageInput,
) {
  const payload = workflowStageInputDtoSchema.parse(input)
  const response = await httpClient.post(
    `/workflows/${encodeURIComponent(workflowId)}/stages`,
    payload,
  )
  const parsed = workflowStageResponseEnvelopeDtoSchema.parse(response.data)
  return mapWorkflowStageResponse(parsed.data)
}

export async function updateWorkflowStage(
  workflowId: string,
  stageId: string,
  input: WorkflowStageInput,
) {
  const payload = workflowStageInputDtoSchema.parse(input)
  const response = await httpClient.patch(
    `/workflows/${encodeURIComponent(workflowId)}/stages/${encodeURIComponent(stageId)}`,
    payload,
  )
  const parsed = workflowStageResponseEnvelopeDtoSchema.parse(response.data)
  return mapWorkflowStageResponse(parsed.data)
}

export async function deleteWorkflowStage(workflowId: string, stageId: string) {
  await httpClient.delete(
    `/workflows/${encodeURIComponent(workflowId)}/stages/${encodeURIComponent(stageId)}`,
  )
}

export async function reorderWorkflowStages(
  workflowId: string,
  stageIds: string[],
) {
  const response = await httpClient.put(
    `/workflows/${encodeURIComponent(workflowId)}/stages/order`,
    { stageIds },
  )
  const parsed = workflowStageListResponseEnvelopeDtoSchema.parse(response.data)
  return parsed.data.map(mapWorkflowStageResponse)
}

export type { WorkflowStageResponseDto }
