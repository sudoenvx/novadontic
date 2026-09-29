import { useState, type PropsWithChildren } from 'react'

import type { AuthSession } from '../domain/auth'
import { AuthContext } from '../context/authContext'

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null)

  function clearSession() {
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: session !== null,
        setSession,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
