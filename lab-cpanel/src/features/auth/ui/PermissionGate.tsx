import type { ReactNode } from 'react'

import type { Permission } from '../../roles-permissions/domain/role'
import { useAuthorization } from '../hooks/useAuthorization'

type PermissionGateProps = {
  permissions: Permission | readonly Permission[]
  mode?: 'all' | 'any'
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGate({
  permissions,
  mode = 'all',
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasAllPermissions, hasAnyPermission } = useAuthorization()
  const requiredPermissions = Array.isArray(permissions)
    ? permissions
    : [permissions]
  const isAllowed = mode === 'any'
    ? hasAnyPermission(requiredPermissions)
    : hasAllPermissions(requiredPermissions)

  return isAllowed ? children : fallback
}
