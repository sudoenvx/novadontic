import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react'

import { getApiErrorMessage, isUnauthorizedApiError } from '../../../shared/api/apiError'
import { setAccessToken } from '../../../shared/api/accessToken'
import { refreshAuthSession, signIn as createAuthSession, signOut as endAuthSession } from '../api/authApi'
import {
  clearStoredRefreshToken,
  readRefreshToken,
  storeRefreshToken,
  type RefreshTokenStorage,
} from '../api/authStorage'
import type { AuthSession, LabSignInValues } from '../domain/auth'
import { AuthContext } from '../context/authContext'

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const sessionRef = useRef<AuthSession | null>(null)

  const commitSession = useCallback(
    (nextSession: AuthSession, storage: RefreshTokenStorage) => {
      storeRefreshToken(nextSession.refreshToken, storage)
      sessionRef.current = nextSession
      setAccessToken(nextSession.accessToken)
      setSession(nextSession)
      setAuthError(null)
    },
    [],
  )

  const clearSession = useCallback(() => {
    try {
      clearStoredRefreshToken()
    } finally {
      sessionRef.current = null
      setAccessToken(null)
      setSession(null)
    }
  }, [])

  const signIn = useCallback(
    async (values: LabSignInValues) => {
      setAuthError(null)
      const nextSession = await createAuthSession({
        email: values.email,
        password: values.password,
      })
      commitSession(nextSession, values.rememberDevice ? 'local' : 'session')
    },
    [commitSession],
  )

  const signOut = useCallback(async () => {
    try {
      await endAuthSession()
    } finally {
      clearSession()
    }
  }, [clearSession])

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      try {
        const stored = readRefreshToken()
        if (!stored) return

        const nextSession = await refreshAuthSession(stored.refreshToken)
        if (isMounted) commitSession(nextSession, stored.storage)
      } catch (error) {
        if (!isMounted) return

        let message = getApiErrorMessage(
          error,
          'Unable to restore your sign-in session.',
        )
        if (isUnauthorizedApiError(error)) {
          try {
            clearStoredRefreshToken()
          } catch (storageError) {
            message = getApiErrorMessage(
              storageError,
              'Unable to clear the expired sign-in session.',
            )
          }
        }
        setAuthError(message)
      } finally {
        if (isMounted) setIsRestoring(false)
      }
    }

    void restoreSession()

    return () => {
      isMounted = false
    }
  }, [commitSession])

  useEffect(() => {
    if (!session) return

    const refreshBeforeExpiryMs = Math.max(0, (session.expiresIn - 30) * 1000)
    const timer = window.setTimeout(() => {
      void refreshAuthSession(session.refreshToken)
        .then((nextSession) => {
          if (sessionRef.current?.refreshToken === session.refreshToken) {
            commitSession(nextSession, readRefreshToken()?.storage ?? 'session')
          }
        })
        .catch((error: unknown) => {
          if (sessionRef.current?.refreshToken !== session.refreshToken) return

          let message = getApiErrorMessage(
            error,
            'Your session expired. Please sign in again.',
          )
          try {
            clearSession()
          } catch (storageError) {
            message = getApiErrorMessage(
              storageError,
              'Unable to clear the expired sign-in session.',
            )
          }
          setAuthError(message)
        })
    }, refreshBeforeExpiryMs)

    return () => window.clearTimeout(timer)
  }, [clearSession, commitSession, session])

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: session !== null,
        isRestoring,
        authError,
        signIn,
        signOut,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
