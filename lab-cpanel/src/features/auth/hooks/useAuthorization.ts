import type { Permission } from '../../roles-permissions/domain/role'
import { useAuth } from './useAuth'

export function useAuthorization() {
  const { session } = useAuth()
  const user = session?.user

  function hasRole(roleId: string): boolean {
    return user?.roles.includes(roleId) ?? false
  }

  function hasPermission(permission: Permission): boolean {
    return user?.permissions.includes(permission) ?? false
  }

  function hasAnyPermission(permissions: readonly Permission[]): boolean {
    return permissions.some(hasPermission)
  }

  function hasAllPermissions(permissions: readonly Permission[]): boolean {
    return permissions.every(hasPermission)
  }

  return {
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}
