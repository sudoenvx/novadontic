import { createContext } from 'react'

import type { AuthSession, LabSignInValues } from '../domain/auth'

export type AuthContextValue = {
  session: AuthSession | null
  isAuthenticated: boolean
  isRestoring: boolean
  authError: string | null
  signIn: (values: LabSignInValues) => Promise<void>
  signOut: () => Promise<void>
  clearSession: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
