import { httpClient } from '../../../shared/api/httpClient'
import type { CursorPaginationParams } from '../../../shared/types/api'
import type { Doctor, DoctorInput, DoctorUpdateInput } from '../domain/doctor'
import {
  doctorInputDtoSchema,
  doctorListResponseDtoSchema,
  doctorResponseEnvelopeDtoSchema,
  doctorUpdateDtoSchema,
} from './doctor.dto'
import {
  mapDoctorInputToDto,
  mapDoctorResponseDtoToDoctor,
  mapDoctorUpdateInputToDto,
} from './doctor.mapper'

export type DoctorListParams = CursorPaginationParams & {
  search?: string
  isActive?: boolean
  clinicId?: string
}

export async function getDoctors(params: DoctorListParams = {}) {
  const data: Doctor[] = []
  let cursor = params.cursor
  let total: number
  do {
    const response = await httpClient.get('/doctors', {
      params: { limit: 100, ...params, cursor },
    })
    const parsed = doctorListResponseDtoSchema.parse(response.data)
    data.push(...parsed.data.data.map(mapDoctorResponseDtoToDoctor))
    cursor = parsed.data.nextCursor ?? undefined
    total = parsed.data.total
  } while (cursor)
  return {
    data,
    total,
  }
}

export async function getDoctor(doctorId: string) {
  const response = await httpClient.get(
    `/doctors/${encodeURIComponent(doctorId)}`,
  )
  const parsed = doctorResponseEnvelopeDtoSchema.parse(response.data)
  return mapDoctorResponseDtoToDoctor(parsed.data)
}

export async function createDoctor(input: DoctorInput) {
  const payload = doctorInputDtoSchema.parse(mapDoctorInputToDto(input))
  const response = await httpClient.post('/doctors', payload)
  const parsed = doctorResponseEnvelopeDtoSchema.parse(response.data)
  return mapDoctorResponseDtoToDoctor(parsed.data)
}

export async function updateDoctor(
  doctorId: string,
  input: DoctorUpdateInput,
) {
  const payload = doctorUpdateDtoSchema.parse(
    mapDoctorUpdateInputToDto(input),
  )
  const response = await httpClient.patch(
    `/doctors/${encodeURIComponent(doctorId)}`,
    payload,
  )
  const parsed = doctorResponseEnvelopeDtoSchema.parse(response.data)
  return mapDoctorResponseDtoToDoctor(parsed.data)
}

export async function deleteDoctor(doctorId: string): Promise<void> {
  await httpClient.delete(`/doctors/${encodeURIComponent(doctorId)}`)
}
