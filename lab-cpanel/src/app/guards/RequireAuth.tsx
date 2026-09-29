import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../features/auth/hooks/useAuth'

export function RequireAuth({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (isAuthenticated) return children

  const from = `${location.pathname}${location.search}${location.hash}`

  return (
    <Navigate
      to="/sign-in"
      replace
      state={{ from }}
    />
  )
}
