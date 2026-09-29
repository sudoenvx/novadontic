import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../features/auth/hooks/useAuth'

export function RequireAuth({ children }: PropsWithChildren) {
  const { isAuthenticated, isRestoring } = useAuth()
  const location = useLocation()

  if (isRestoring) {
    return (
      <main className="grid min-h-dvh place-items-center bg-canvas text-sm text-text-secondary" role="status">
        Restoring your session…
      </main>
    )
  }

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
