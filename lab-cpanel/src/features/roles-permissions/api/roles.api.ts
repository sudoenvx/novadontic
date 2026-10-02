import { httpClient } from '../../../shared/api/httpClient'
import type { Role, RolePermission } from '../domain/role'
import {
  roleEnvelopeSchema,
  roleInputSchema,
  roleListEnvelopeSchema,
  rolePermissionsEnvelopeSchema,
  roleUpdateSchema,
  setRolePermissionsSchema,
} from './roleResponse'
import type { RolePermissionResponse } from './roleResponse'
import { mapRoleResponseToRole } from './mapRoleResponseToRole'

export async function getRoles(search?: string): Promise<Role[]> {
  const response = await httpClient.get('/roles', {
    params: { search: search?.trim() || undefined },
  })
  const parsed = roleListEnvelopeSchema.parse(response.data)
  return parsed.data.map(mapRoleResponseToRole)
}

export async function getRolePermissions(): Promise<RolePermission[]> {
  const response = await httpClient.get('/roles/permissions')
  const parsed = rolePermissionsEnvelopeSchema.parse(response.data)
  return parsed.data.map(mapRolePermission)
}

export async function createRole(input: {
  name: string
  description: string
}): Promise<Role> {
  const payload = roleInputSchema.parse(input)
  const response = await httpClient.post('/roles', payload)
  return mapRoleResponseToRole(roleEnvelopeSchema.parse(response.data).data)
}

export async function updateRole(
  roleId: string,
  input: Partial<{ name: string; description: string }>,
): Promise<Role> {
  const payload = roleUpdateSchema.parse(input)
  const response = await httpClient.patch(
    `/roles/${encodeURIComponent(roleId)}`,
    payload,
  )
  return mapRoleResponseToRole(roleEnvelopeSchema.parse(response.data).data)
}

export async function setRolePermissions(
  roleId: string,
  permissionCodes: string[],
): Promise<Role> {
  const payload = setRolePermissionsSchema.parse({ permissionCodes })
  const response = await httpClient.put(
    `/roles/${encodeURIComponent(roleId)}/permissions`,
    payload,
  )
  return mapRoleResponseToRole(roleEnvelopeSchema.parse(response.data).data)
}

export async function deleteRole(roleId: string): Promise<void> {
  await httpClient.delete(`/roles/${encodeURIComponent(roleId)}`)
}

function mapRolePermission(response: RolePermissionResponse): RolePermission {
  return {
    code: response.code,
    module: response.module,
    description: response.description,
  }
}
