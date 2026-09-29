const refreshTokenStorageKey = 'novadontic.auth.refresh-token'

export type RefreshTokenStorage = 'local' | 'session'

export function readRefreshToken(): {
  refreshToken: string
  storage: RefreshTokenStorage
} | null {
  const persistentToken = window.localStorage.getItem(refreshTokenStorageKey)
  if (persistentToken) {
    return { refreshToken: persistentToken, storage: 'local' }
  }

  const sessionToken = window.sessionStorage.getItem(refreshTokenStorageKey)
  return sessionToken
    ? { refreshToken: sessionToken, storage: 'session' }
    : null
}

export function storeRefreshToken(
  refreshToken: string,
  storage: RefreshTokenStorage,
): void {
  const targetStorage =
    storage === 'local' ? window.localStorage : window.sessionStorage
  const otherStorage =
    storage === 'local' ? window.sessionStorage : window.localStorage

  targetStorage.setItem(refreshTokenStorageKey, refreshToken)
  otherStorage.removeItem(refreshTokenStorageKey)
}

export function clearStoredRefreshToken(): void {
  window.localStorage.removeItem(refreshTokenStorageKey)
  window.sessionStorage.removeItem(refreshTokenStorageKey)
}
