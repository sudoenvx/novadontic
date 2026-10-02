import { httpClient } from '../../../shared/api/httpClient'
import type { CursorPaginationParams } from '../../../shared/types/api'
import type { ClinicInput } from '../domain/clinic'
import {
  clinicInputDtoSchema,
  clinicListResponseDtoSchema,
  clinicOptionListResponseDtoSchema,
  clinicResponseEnvelopeDtoSchema,
  clinicUpdateDtoSchema,
} from './clinic.dto'
import {
  mapClinicOptionResponseDtoToClinicOption,
  mapClinicInputToDto,
  mapClinicResponseDtoToClinic,
  mapClinicUpdateInputToDto,
} from './clinic.mapper'

export type ClinicListParams = CursorPaginationParams & {
  search?: string
  isActive?: boolean
}

export async function getClinics(params: Omit<ClinicListParams, 'cursor'> = {}) {
  const clinics = []
  let cursor: string | undefined

  do {
    const response = await httpClient.get('/clinics', {
      params: { limit: 100, ...params, cursor },
    })
    const parsed = clinicListResponseDtoSchema.parse(response.data)
    clinics.push(...parsed.data.data.map(mapClinicResponseDtoToClinic))
    cursor = parsed.data.nextCursor ?? undefined
  } while (cursor)

  return clinics
}

export async function getClinicOptions() {
  const options = []
  let cursor: string | undefined

  do {
    const response = await httpClient.get('/clinics', {
      params: { isActive: true, limit: 100, cursor },
    })
    const parsed = clinicOptionListResponseDtoSchema.parse(response.data)
    options.push(...parsed.data.data.map(mapClinicOptionResponseDtoToClinicOption))
    cursor = parsed.data.nextCursor ?? undefined
  } while (cursor)

  return options
}

export async function getClinic(clinicId: string) {
  const response = await httpClient.get(
    `/clinics/${encodeURIComponent(clinicId)}`,
  )
  const parsed = clinicResponseEnvelopeDtoSchema.parse(response.data)
  return mapClinicResponseDtoToClinic(parsed.data)
}

export async function createClinic(input: ClinicInput) {
  const payload = clinicInputDtoSchema.parse(mapClinicInputToDto(input))
  const response = await httpClient.post('/clinics', payload)
  const parsed = clinicResponseEnvelopeDtoSchema.parse(response.data)
  return mapClinicResponseDtoToClinic(parsed.data)
}

export async function updateClinic(
  clinicId: string,
  input: Partial<ClinicInput>,
) {
  const payload = clinicUpdateDtoSchema.parse(
    mapClinicUpdateInputToDto(input),
  )
  const response = await httpClient.patch(
    `/clinics/${encodeURIComponent(clinicId)}`,
    payload,
  )
  const parsed = clinicResponseEnvelopeDtoSchema.parse(response.data)
  return mapClinicResponseDtoToClinic(parsed.data)
}

export async function deactivateClinic(clinicId: string): Promise<void> {
  await httpClient.delete(`/clinics/${encodeURIComponent(clinicId)}`)
}
