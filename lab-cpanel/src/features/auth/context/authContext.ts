import { createContext } from 'react'

import type { AuthSession } from '../domain/auth'

export type AuthContextValue = {
  session: AuthSession | null
  isAuthenticated: boolean
  setSession: (session: AuthSession) => void
  clearSession: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
