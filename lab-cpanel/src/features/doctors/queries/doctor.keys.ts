import type { DoctorListParams } from '../api/doctor.api'

export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (params: DoctorListParams) => [...doctorKeys.lists(), params] as const,
  details: () => [...doctorKeys.all, 'detail'] as const,
  detail: (doctorId: string) =>
    [...doctorKeys.details(), doctorId] as const,
}
