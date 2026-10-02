import { useQueryClient } from '@tanstack/react-query'

import {
  useGetQuery,
  useMutationAction,
} from '../../../shared/api/queryHooks'
import {
  createDoctor,
  deleteDoctor,
  getDoctor,
  getDoctors,
  updateDoctor,
} from '../api/doctor.api'
import type { DoctorInput, DoctorUpdateInput } from '../domain/doctor'
import { doctorKeys } from './doctor.keys'

export function useDoctors(search?: string, enabled = true) {
  const params = { search: search?.trim() || undefined }
  return useGetQuery({
    queryKey: doctorKeys.list(params),
    queryFn: () => getDoctors(params),
    enabled,
  })
}

export function useDoctor(doctorId: string) {
  return useGetQuery({
    queryKey: doctorKeys.detail(doctorId),
    queryFn: () => getDoctor(doctorId),
    enabled: Boolean(doctorId),
  })
}

export function useCreateDoctor() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: (input: DoctorInput) => createDoctor(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: doctorKeys.all }),
  })
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: ({
      doctorId,
      input,
    }: {
      doctorId: string
      input: DoctorUpdateInput
    }) => updateDoctor(doctorId, input),
    onSuccess: (doctor) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorKeys.all }),
        queryClient.setQueryData(doctorKeys.detail(doctor.id), doctor),
      ]),
  })
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: (doctorId: string) => deleteDoctor(doctorId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: doctorKeys.all }),
  })
}
