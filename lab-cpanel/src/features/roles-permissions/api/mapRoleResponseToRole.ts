import type { Role } from '../domain/role'
import type { RoleResponse } from './roleResponse'

export function mapRoleResponseToRole(response: RoleResponse): Role {
  return {
    id: response.id,
    name: response.name,
    description: response.description,
    type: response.type,
    permissions: response.permission_codes,
    staffCount: response.staff_count,
  }
}
