import { useQueryClient } from '@tanstack/react-query'

import { useGetQuery, useMutationAction } from '../../../shared/api/queryHooks'
import {
  createStaff,
  deleteStaff,
  getAssignableStaffRoles,
  getStaff,
  getStaffMember,
  setStaffActive,
  updateStaff,
} from '../api/staff.api'
import type {
  CreateStaffInput,
  UpdateStaffInput,
} from '../domain/staff'
import { staffKeys } from './staff.keys'

export function useStaff(search?: string, enabled = true) {
  const params = { search: search?.trim() || undefined }
  return useGetQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => getStaff(params),
    enabled,
  })
}

export function useStaffMember(staffId: string) {
  return useGetQuery({
    queryKey: staffKeys.detail(staffId),
    queryFn: () => getStaffMember(staffId),
    enabled: Boolean(staffId),
  })
}

export function useAssignableStaffRoles() {
  return useGetQuery({
    queryKey: staffKeys.roles(),
    queryFn: getAssignableStaffRoles,
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: (input: CreateStaffInput) => createStaff(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: ({
      staffId,
      input,
    }: {
      staffId: string
      input: UpdateStaffInput
    }) => updateStaff(staffId, input),
    onSuccess: (member) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: staffKeys.all }),
        queryClient.setQueryData(staffKeys.detail(member.id), member),
      ]),
  })
}

export function useSetStaffActive() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: ({ staffId, isActive }: { staffId: string; isActive: boolean }) =>
      setStaffActive(staffId, isActive),
    onSuccess: (member) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: staffKeys.all }),
        queryClient.setQueryData(staffKeys.detail(member.id), member),
      ]),
  })
}

export function useDeleteStaff() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: (staffId: string) => deleteStaff(staffId),
    onSuccess: (_result, staffId) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: staffKeys.all }),
        queryClient.removeQueries({ queryKey: staffKeys.detail(staffId) }),
      ]),
  })
}
