import { useQueryClient } from '@tanstack/react-query'

import {
  useGetQuery,
  useMutationAction,
} from '../../../shared/api/queryHooks'
import {
  getSettings,
  saveSettings,
} from '../api/labSettings.api'
import {
  mapLabSettingsSectionToSaveDtos,
  mapSettingDtosToLabSettings,
} from '../api/labSettings.mapper'
import type { LabSettings, LabSettingsSection } from '../domain/labSettings'
import { labSettingsKeys } from './labSettings.keys'

export function useLabSettings() {
  return useGetQuery({
    queryKey: labSettingsKeys.all,
    queryFn: async () => mapSettingDtosToLabSettings(await getSettings()),
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
    }) => saveSettings(mapLabSettingsSectionToSaveDtos(section, settings)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: labSettingsKeys.all }),
    onError: () =>
      queryClient.invalidateQueries({ queryKey: labSettingsKeys.all }),
  })
}
