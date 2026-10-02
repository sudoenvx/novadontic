import { useQueryClient } from '@tanstack/react-query'

import {
  useGetQuery,
  useMutationAction,
} from '../../../shared/api/queryHooks'
import {
  createAppliance,
  createApplianceField,
  createApplianceGroup,
  deleteAppliance,
  deleteApplianceField,
  deleteApplianceGroup,
  getAppliance,
  getAppliances,
  setApplianceActive,
  updateAppliance,
  updateApplianceField,
  updateApplianceGroup,
} from '../api/appliance.api'
import type {
  ApplianceFieldGroupInput,
  ApplianceFieldInput,
  ApplianceTypeInput,
} from '../domain/appliance'
import { applianceKeys } from './appliance.keys'

export function useAppliances(search?: string) {
  const params = { search: search?.trim() || undefined }
  return useGetQuery({
    queryKey: applianceKeys.list(params),
    queryFn: () => getAppliances(params),
  })
}

export function useAppliance(applianceTypeId: string) {
  return useGetQuery({
    queryKey: applianceKeys.detail(applianceTypeId),
    queryFn: () => getAppliance(applianceTypeId),
    enabled: Boolean(applianceTypeId),
  })
}

function useInvalidateAppliances() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: applianceKeys.all })
}

export function useCreateAppliance() {
  const invalidate = useInvalidateAppliances()
  return useMutationAction({
    mutationFn: (input: ApplianceTypeInput) => createAppliance(input),
    onSuccess: invalidate,
  })
}

export function useUpdateAppliance() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: ({
      applianceTypeId,
      input,
    }: {
      applianceTypeId: string
      input: Partial<ApplianceTypeInput>
    }) => updateAppliance(applianceTypeId, input),
    onSuccess: (appliance) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: applianceKeys.all }),
        queryClient.setQueryData(
          applianceKeys.detail(appliance.id),
          appliance,
        ),
      ]),
  })
}

export function useSetApplianceActive() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: ({
      applianceTypeId,
      isActive,
    }: {
      applianceTypeId: string
      isActive: boolean
    }) => setApplianceActive(applianceTypeId, isActive),
    onSuccess: (appliance) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: applianceKeys.all }),
        queryClient.setQueryData(
          applianceKeys.detail(appliance.id),
          appliance,
        ),
      ]),
  })
}

export function useDeleteAppliance() {
  const invalidate = useInvalidateAppliances()
  return useMutationAction({
    mutationFn: (applianceTypeId: string) => deleteAppliance(applianceTypeId),
    onSuccess: invalidate,
  })
}

export function useCreateApplianceGroup() {
  const invalidate = useInvalidateAppliances()
  return useMutationAction({
    mutationFn: ({
      applianceTypeId,
      input,
    }: {
      applianceTypeId: string
      input: ApplianceFieldGroupInput
    }) => createApplianceGroup(applianceTypeId, input),
    onSuccess: invalidate,
  })
}

export function useUpdateApplianceGroup() {
  const invalidate = useInvalidateAppliances()
  return useMutationAction({
    mutationFn: ({
      applianceTypeId,
      groupId,
      input,
    }: {
      applianceTypeId: string
      groupId: string
      input: Partial<ApplianceFieldGroupInput>
    }) => updateApplianceGroup(applianceTypeId, groupId, input),
    onSuccess: invalidate,
  })
}

export function useDeleteApplianceGroup() {
  const invalidate = useInvalidateAppliances()
  return useMutationAction({
    mutationFn: ({
      applianceTypeId,
      groupId,
    }: {
      applianceTypeId: string
      groupId: string
    }) => deleteApplianceGroup(applianceTypeId, groupId),
    onSuccess: invalidate,
  })
}

export function useCreateApplianceField() {
  const invalidate = useInvalidateAppliances()
  return useMutationAction({
    mutationFn: ({
      applianceTypeId,
      groupId,
      input,
    }: {
      applianceTypeId: string
      groupId: string
      input: ApplianceFieldInput
    }) => createApplianceField(applianceTypeId, groupId, input),
    onSuccess: invalidate,
  })
}

export function useUpdateApplianceField() {
  const invalidate = useInvalidateAppliances()
  return useMutationAction({
    mutationFn: ({
      applianceTypeId,
      groupId,
      fieldId,
      input,
    }: {
      applianceTypeId: string
      groupId: string
      fieldId: string
      input: Partial<ApplianceFieldInput>
    }) =>
      updateApplianceField(applianceTypeId, groupId, fieldId, input),
    onSuccess: invalidate,
  })
}

export function useDeleteApplianceField() {
  const invalidate = useInvalidateAppliances()
  return useMutationAction({
    mutationFn: ({
      applianceTypeId,
      groupId,
      fieldId,
    }: {
      applianceTypeId: string
      groupId: string
      fieldId: string
    }) => deleteApplianceField(applianceTypeId, groupId, fieldId),
    onSuccess: invalidate,
  })
}
