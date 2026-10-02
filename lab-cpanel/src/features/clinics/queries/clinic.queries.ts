import { useQueryClient } from '@tanstack/react-query'

import {
  useGetQuery,
  useMutationAction,
} from '../../../shared/api/queryHooks'
import {
  createClinic,
  deactivateClinic,
  getClinic,
  getClinics,
  getClinicOptions,
  updateClinic,
} from '../api/clinic.api'
import type { ClinicInput } from '../domain/clinic'
import { clinicKeys } from './clinic.keys'

export function useClinics() {
  return useGetQuery({
    queryKey: clinicKeys.list(),
    queryFn: () => getClinics(),
  })
}

export function useClinic(clinicId: string) {
  return useGetQuery({
    queryKey: clinicKeys.detail(clinicId),
    queryFn: () => getClinic(clinicId),
    enabled: Boolean(clinicId),
  })
}

export function useClinicOptions() {
  return useGetQuery({
    queryKey: clinicKeys.options(),
    queryFn: getClinicOptions,
  })
}

export function useCreateClinic() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: (input: ClinicInput) => createClinic(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: clinicKeys.all }),
  })
}

export function useUpdateClinic() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: ({
      clinicId,
      input,
    }: {
      clinicId: string
      input: Partial<ClinicInput>
    }) => updateClinic(clinicId, input),
    onSuccess: (clinic) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: clinicKeys.all }),
        queryClient.setQueryData(clinicKeys.detail(clinic.id), clinic),
      ]),
  })
}

export function useDeactivateClinic() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: (clinicId: string) => deactivateClinic(clinicId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: clinicKeys.all }),
  })
}
