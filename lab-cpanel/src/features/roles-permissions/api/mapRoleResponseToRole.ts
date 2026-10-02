import type { Role } from '../domain/role'
import type { RoleResponse } from './roleResponse'

export function mapRoleResponseToRole(response: RoleResponse): Role {
  return {
    id: response.id,
    code: response.code,
    name: response.name,
    description: response.description,
    type: response.type,
    isSystem: response.isSystem,
    permissions: response.permissions,
    staffCount: response.staffCount,
  }
}
