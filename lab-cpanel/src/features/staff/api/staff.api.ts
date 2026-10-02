import { httpClient } from '../../../shared/api/httpClient'
import type {
  CreateStaffInput,
  Staff,
  StaffListParams,
  UpdateStaffInput,
} from '../domain/staff'
import {
  staffEnvelopeDtoSchema,
  staffInputDtoSchema,
  staffListEnvelopeDtoSchema,
  staffRoleOptionsEnvelopeDtoSchema,
  staffUpdateDtoSchema,
} from './staff.dto'
import {
  mapStaffDtoToStaff,
  mapStaffInputToDto,
  mapStaffUpdateInputToDto,
} from './staff.mapper'

export async function getStaff(params: StaffListParams = {}) {
  const firstResponse = await httpClient.get('/staff', {
    params: { limit: 100, ...params, cursor: params.cursor },
  })
  const firstPage = staffListEnvelopeDtoSchema.parse(firstResponse.data).data
  const data: Staff[] = firstPage.data.map(mapStaffDtoToStaff)
  let cursor = firstPage.nextCursor

  while (cursor) {
    const response = await httpClient.get('/staff', {
      params: { limit: 100, ...params, cursor },
    })
    const page = staffListEnvelopeDtoSchema.parse(response.data).data
    data.push(...page.data.map(mapStaffDtoToStaff))
    cursor = page.nextCursor
  }

  return { data, total: firstPage.total }
}

export async function getStaffMember(staffId: string) {
  const response = await httpClient.get(`/staff/${encodeURIComponent(staffId)}`)
  const parsed = staffEnvelopeDtoSchema.parse(response.data)
  return mapStaffDtoToStaff(parsed.data)
}

export async function getAssignableStaffRoles() {
  const response = await httpClient.get('/roles')
  const parsed = staffRoleOptionsEnvelopeDtoSchema.parse(response.data)
  return parsed.data.filter((role) => role.code !== 'owner')
}

export async function createStaff(input: CreateStaffInput) {
  const payload = staffInputDtoSchema.parse(mapStaffInputToDto(input))
  const response = await httpClient.post('/staff', payload)
  const parsed = staffEnvelopeDtoSchema.parse(response.data)
  return mapStaffDtoToStaff(parsed.data)
}

export async function updateStaff(staffId: string, input: UpdateStaffInput) {
  const payload = staffUpdateDtoSchema.parse(mapStaffUpdateInputToDto(input))
  const response = await httpClient.patch(
    `/staff/${encodeURIComponent(staffId)}`,
    payload,
  )
  const parsed = staffEnvelopeDtoSchema.parse(response.data)
  return mapStaffDtoToStaff(parsed.data)
}

export async function setStaffActive(staffId: string, isActive: boolean) {
  const response = await httpClient.patch(
    `/staff/${encodeURIComponent(staffId)}/status`,
    { isActive },
  )
  const parsed = staffEnvelopeDtoSchema.parse(response.data)
  return mapStaffDtoToStaff(parsed.data)
}

export async function deleteStaff(staffId: string): Promise<void> {
  await httpClient.delete(`/staff/${encodeURIComponent(staffId)}`)
}
