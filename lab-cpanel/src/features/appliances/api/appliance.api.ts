import { httpClient } from '../../../shared/api/httpClient'
import type { CursorPaginationParams } from '../../../shared/types/api'
import type {
  ApplianceFieldGroupInput,
  ApplianceFieldInput,
  ApplianceTypeInput,
} from '../domain/appliance'
import {
  applianceActivationDtoSchema,
  applianceFieldInputDtoSchema,
  applianceFieldResponseEnvelopeDtoSchema,
  applianceFieldUpdateDtoSchema,
  applianceGroupInputDtoSchema,
  applianceGroupListResponseDtoSchema,
  applianceGroupResponseEnvelopeDtoSchema,
  applianceGroupUpdateDtoSchema,
  applianceListResponseDtoSchema,
  applianceResponseEnvelopeDtoSchema,
  applianceTypeInputDtoSchema,
  applianceTypeUpdateDtoSchema,
} from './appliance.dto'
import {
  mapApplianceFieldGroupResponseDto,
  mapApplianceFieldResponseDto,
  mapApplianceResponseDtoToAppliance,
  mapApplianceFieldInputToDto,
  mapApplianceGroupInputToDto,
  mapApplianceTypeInputToDto,
} from './appliance.mapper'

export type ApplianceListParams = CursorPaginationParams & {
  search?: string
  isActive?: boolean
}

export async function getAppliances(
  params: Omit<ApplianceListParams, 'cursor'> = {},
) {
  const appliances = []
  let cursor: string | undefined

  do {
    const response = await httpClient.get('/appliances', {
      params: { limit: 100, ...params, cursor },
    })
    const parsed = applianceListResponseDtoSchema.parse(response.data)
    appliances.push(
      ...parsed.data.data.map(mapApplianceResponseDtoToAppliance),
    )
    cursor = parsed.data.nextCursor ?? undefined
  } while (cursor)

  return appliances
}

export async function getAppliance(applianceTypeId: string) {
  const response = await httpClient.get(
    `/appliances/${encodeURIComponent(applianceTypeId)}`,
  )
  const parsed = applianceResponseEnvelopeDtoSchema.parse(response.data)
  return mapApplianceResponseDtoToAppliance(parsed.data)
}

export async function getApplianceGroups(applianceTypeId: string) {
  const response = await httpClient.get(
    `/appliances/${encodeURIComponent(applianceTypeId)}/field-groups`,
  )
  const parsed = applianceGroupListResponseDtoSchema.parse(response.data)
  return parsed.data.map(mapApplianceFieldGroupResponseDto)
}

export async function createAppliance(input: ApplianceTypeInput) {
  const payload = applianceTypeInputDtoSchema.parse(
    mapApplianceTypeInputToDto(input),
  )
  const response = await httpClient.post('/appliances', payload)
  const parsed = applianceResponseEnvelopeDtoSchema.parse(response.data)
  return mapApplianceResponseDtoToAppliance(parsed.data)
}

export async function updateAppliance(
  applianceTypeId: string,
  input: Partial<ApplianceTypeInput>,
) {
  const payload = applianceTypeUpdateDtoSchema.parse(
    mapApplianceTypeInputToDto(input),
  )
  const response = await httpClient.patch(
    `/appliances/${encodeURIComponent(applianceTypeId)}`,
    payload,
  )
  const parsed = applianceResponseEnvelopeDtoSchema.parse(response.data)
  return mapApplianceResponseDtoToAppliance(parsed.data)
}

export async function setApplianceActive(
  applianceTypeId: string,
  isActive: boolean,
) {
  const payload = applianceActivationDtoSchema.parse({ isActive })
  const response = await httpClient.patch(
    `/appliances/${encodeURIComponent(applianceTypeId)}/activation`,
    payload,
  )
  const parsed = applianceResponseEnvelopeDtoSchema.parse(response.data)
  return mapApplianceResponseDtoToAppliance(parsed.data)
}

export async function deleteAppliance(applianceTypeId: string): Promise<void> {
  await httpClient.delete(`/appliances/${encodeURIComponent(applianceTypeId)}`)
}

export async function createApplianceGroup(
  applianceTypeId: string,
  input: ApplianceFieldGroupInput,
) {
  const payload = applianceGroupInputDtoSchema.parse(
    mapApplianceGroupInputToDto(input),
  )
  const response = await httpClient.post(
    `/appliances/${encodeURIComponent(applianceTypeId)}/field-groups`,
    payload,
  )
  const parsed = applianceGroupResponseEnvelopeDtoSchema.parse(response.data)
  return mapApplianceFieldGroupResponseDto(parsed.data)
}

export async function updateApplianceGroup(
  applianceTypeId: string,
  groupId: string,
  input: Partial<ApplianceFieldGroupInput>,
) {
  const payload = applianceGroupUpdateDtoSchema.parse(input)
  const response = await httpClient.patch(
    `/appliances/${encodeURIComponent(applianceTypeId)}/field-groups/${encodeURIComponent(groupId)}`,
    payload,
  )
  const parsed = applianceGroupResponseEnvelopeDtoSchema.parse(response.data)
  return mapApplianceFieldGroupResponseDto(parsed.data)
}

export async function deleteApplianceGroup(
  applianceTypeId: string,
  groupId: string,
): Promise<void> {
  await httpClient.delete(
    `/appliances/${encodeURIComponent(applianceTypeId)}/field-groups/${encodeURIComponent(groupId)}`,
  )
}

export async function createApplianceField(
  applianceTypeId: string,
  groupId: string,
  input: ApplianceFieldInput,
) {
  const payload = applianceFieldInputDtoSchema.parse(
    mapApplianceFieldInputToDto(input),
  )
  const response = await httpClient.post(
    `/appliances/${encodeURIComponent(applianceTypeId)}/field-groups/${encodeURIComponent(groupId)}/fields`,
    payload,
  )
  const parsed = applianceFieldResponseEnvelopeDtoSchema.parse(response.data)
  return mapApplianceFieldResponseDto(parsed.data)
}

export async function updateApplianceField(
  applianceTypeId: string,
  groupId: string,
  fieldId: string,
  input: Partial<ApplianceFieldInput>,
) {
  const payload = applianceFieldUpdateDtoSchema.parse(input)
  const response = await httpClient.patch(
    `/appliances/${encodeURIComponent(applianceTypeId)}/field-groups/${encodeURIComponent(groupId)}/fields/${encodeURIComponent(fieldId)}`,
    payload,
  )
  const parsed = applianceFieldResponseEnvelopeDtoSchema.parse(response.data)
  return mapApplianceFieldResponseDto(parsed.data)
}

export async function deleteApplianceField(
  applianceTypeId: string,
  groupId: string,
  fieldId: string,
): Promise<void> {
  await httpClient.delete(
    `/appliances/${encodeURIComponent(applianceTypeId)}/field-groups/${encodeURIComponent(groupId)}/fields/${encodeURIComponent(fieldId)}`,
  )
}
