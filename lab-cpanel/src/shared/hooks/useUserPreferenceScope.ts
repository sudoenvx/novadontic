import { useContext } from 'react'

import { UserPreferenceScopeContext } from '../context/userPreferenceScopeContext'

export function useUserPreferenceScope() {
  return useContext(UserPreferenceScopeContext)
}
