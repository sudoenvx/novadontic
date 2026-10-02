import type { PropsWithChildren } from 'react'

import { UserPreferenceScopeContext } from '../context/userPreferenceScopeContext'

type UserPreferenceScopeProviderProps = PropsWithChildren<{
  userId: string | undefined
}>

export function UserPreferenceScopeProvider({
  children,
  userId,
}: UserPreferenceScopeProviderProps) {
  return (
    <UserPreferenceScopeContext.Provider value={userId}>
      {children}
    </UserPreferenceScopeContext.Provider>
  )
}
