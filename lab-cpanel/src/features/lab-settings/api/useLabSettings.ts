import { useQueryClient } from '@tanstack/react-query'

import {
  useGetQuery,
  useMutationAction,
} from '../../../shared/api/queryHooks'
import {
  getLabSettings,
  saveLabSettingsSection,
} from './labSettingsApi'
import type { LabSettings, LabSettingsSection } from '../domain/labSettings'

export const labSettingsQueryKey = ['lab-settings'] as const

export function useLabSettings() {
  return useGetQuery({
    queryKey: labSettingsQueryKey,
    queryFn: getLabSettings,
  })
}

export function useSaveLabSettings() {
  const queryClient = useQueryClient()

  return useMutationAction({
    mutationFn: ({
      section,
      settings,
    }: {
      section: LabSettingsSection
      settings: LabSettings
    }) => saveLabSettingsSection(section, settings),
    onSuccess: (settings) => {
      queryClient.setQueryData(labSettingsQueryKey, settings)
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: labSettingsQueryKey })
    },
  })
}
