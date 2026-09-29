import {
  hasAllRolePermissions,
  hasAnyRolePermission,
  hasRolePermission,
  type Permission,
} from '../../roles-permissions/domain/role'
import { useAuth } from './useAuth'

export function useAuthorization() {
  const { session } = useAuth()
  const role = session?.user.role

  function hasRole(roleId: string): boolean {
    return role?.id === roleId
  }

  function hasPermission(permission: Permission): boolean {
    return role ? hasRolePermission(role, permission) : false
  }

  function hasAnyPermission(permissions: readonly Permission[]): boolean {
    return role ? hasAnyRolePermission(role, permissions) : false
  }

  function hasAllPermissions(permissions: readonly Permission[]): boolean {
    return role ? hasAllRolePermissions(role, permissions) : false
  }

  return {
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}
