import { useQueryClient } from '@tanstack/react-query'

import {
  useGetQuery,
  useMutationAction,
} from '../../../shared/api/queryHooks'
import {
  createRole,
  deleteRole,
  getRolePermissions,
  getRoles,
  setRolePermissions,
  updateRole,
} from '../api/roles.api'
import { roleKeys } from './role.keys'

export function useRoles(search?: string) {
  const normalizedSearch = search?.trim() || undefined
  return useGetQuery({
    queryKey: roleKeys.list(normalizedSearch),
    queryFn: () => getRoles(normalizedSearch),
  })
}

export function useRolePermissions() {
  return useGetQuery({
    queryKey: roleKeys.permissions(),
    queryFn: getRolePermissions,
  })
}

function useInvalidateRoles() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: roleKeys.all })
}

export function useCreateRole() {
  const invalidate = useInvalidateRoles()
  return useMutationAction({
    mutationFn: createRole,
    onSuccess: invalidate,
  })
}

export function useUpdateRole() {
  const invalidate = useInvalidateRoles()
  return useMutationAction({
    mutationFn: ({
      roleId,
      input,
    }: {
      roleId: string
      input: Partial<{ name: string; description: string }>
    }) => updateRole(roleId, input),
    onSuccess: invalidate,
  })
}

export function useSetRolePermissions() {
  const invalidate = useInvalidateRoles()
  return useMutationAction({
    mutationFn: ({
      roleId,
      permissionCodes,
    }: {
      roleId: string
      permissionCodes: string[]
    }) => setRolePermissions(roleId, permissionCodes),
    onSuccess: invalidate,
  })
}

export function useDeleteRole() {
  const invalidate = useInvalidateRoles()
  return useMutationAction({
    mutationFn: deleteRole,
    onSuccess: invalidate,
  })
}
