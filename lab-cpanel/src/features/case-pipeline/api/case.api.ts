import { httpClient } from '../../../shared/api/httpClient'
import {
  type UpdateCaseRequest,
  type CreateCaseRequest,
  caseListResponseDtoSchema,
  caseResponseEnvelopeDtoSchema,
  createCaseInputDtoSchema,
  updateCaseInputDtoSchema,
  updateCaseStageStatusInputDtoSchema,
} from './case.dto'
import {
  mapCaseResponseToCasePipelineCase,
} from './case.mapper'

export async function getCases(search?: string) {
  const cases = []
  let cursor: string | undefined
  do {
    const response = await httpClient.get('/cases', {
      params: { limit: 100, cursor, search: search?.trim() || undefined },
    })
    const parsed = caseListResponseDtoSchema.parse(response.data)
    cases.push(...parsed.data.data.map(mapCaseResponseToCasePipelineCase))
    cursor = parsed.data.nextCursor ?? undefined
  } while (cursor)
  return cases
}

export async function getCase(caseNumber: string) {
  const response = await httpClient.get(`/cases/${encodeURIComponent(caseNumber)}`)
  const parsed = caseResponseEnvelopeDtoSchema.parse(response.data)
  return mapCaseResponseToCasePipelineCase(parsed.data)
}

export async function createCase(input: CreateCaseRequest) {
  const payload = createCaseInputDtoSchema.parse(input)
  const response = await httpClient.post('/cases', payload)
  const parsed = caseResponseEnvelopeDtoSchema.parse(response.data)
  return mapCaseResponseToCasePipelineCase(parsed.data)
}

export async function updateCase(
  caseNumber: string,
  input: UpdateCaseRequest,
) {
  const payload = updateCaseInputDtoSchema.parse(input)
  const response = await httpClient.patch(
    `/cases/${encodeURIComponent(caseNumber)}`,
    payload,
  )
  const parsed = caseResponseEnvelopeDtoSchema.parse(response.data)
  return mapCaseResponseToCasePipelineCase(parsed.data)
}

export async function updateCaseStageStatus(
  caseNumber: string,
  stageId: string,
  status: 'active' | 'completed',
) {
  const payload = updateCaseStageStatusInputDtoSchema.parse({ status })
  const response = await httpClient.patch(
    `/cases/${encodeURIComponent(caseNumber)}/stages/${encodeURIComponent(stageId)}/status`,
    payload,
  )
  const parsed = caseResponseEnvelopeDtoSchema.parse(response.data)
  return mapCaseResponseToCasePipelineCase(parsed.data)
}
