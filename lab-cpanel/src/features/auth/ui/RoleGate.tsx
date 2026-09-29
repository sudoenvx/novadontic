import type { ReactNode } from 'react'

import { useAuthorization } from '../hooks/useAuthorization'

type RoleGateProps = {
  roleId: string
  fallback?: ReactNode
  children: ReactNode
}

export function RoleGate({
  roleId,
  fallback = null,
  children,
}: RoleGateProps) {
  const { hasRole } = useAuthorization()

  return hasRole(roleId) ? children : fallback
}
