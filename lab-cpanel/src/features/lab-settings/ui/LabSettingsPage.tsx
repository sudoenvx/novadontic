import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/apiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { FormLoading } from '../../../shared/ui/Loading'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { Page } from '../../../shared/ui/Page'
import { toast } from '../../../shared/ui/Toast'
import { useLabSettings, useSaveLabSettings } from '../queries/labSettings.queries'
import { getLabSettingsSectionLabel, type LabSettings, type LabSettingsSection } from '../domain/labSettings'
import { LabNotificationsForm } from './LabNotificationsForm'
import { LabOperationsForm } from './LabOperationsForm'
import { LabSettingsSidebar } from './LabSettingsSidebar'

const sectionDescriptions: Record<LabSettingsSection, string> = {
  operations: 'Control the access rules that shape how clinics submit work.',
  notifications: 'Choose which events should reach your lab team by email.',
}

export function LabSettingsPage() {
  const settingsQuery = useLabSettings()
  const saveSettings = useSaveLabSettings()
  const [draftSettings, setDraftSettings] = useState<
    Partial<Record<LabSettingsSection, LabSettings>>
  >({})
  const [selectedSection, setSelectedSection] = useState<LabSettingsSection>('operations')

  const settings = settingsQuery.data
    ? { ...settingsQuery.data, ...draftSettings[selectedSection] }
    : undefined

  function updateSettings(changes: Partial<LabSettings>) {
    if (!settings) return
    setDraftSettings((current) => ({
      ...current,
      [selectedSection]: { ...settings, ...changes },
    }))
  }

  async function saveSection() {
    if (!settings) return

    try {
      await saveSettings.mutateAsync({ section: selectedSection, settings })
      setDraftSettings((current) => {
        const nextDrafts = { ...current }
        delete nextDrafts[selectedSection]
        return nextDrafts
      })
      toast.add({
        title: `${getLabSettingsSectionLabel(selectedSection)} updated`,
        description: 'Your lab settings have been saved.',
        type: 'success',
      })
    } catch (error) {
      toast.add({
        title: 'Unable to save settings',
        description: getApiErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
    }
  }

  return (
    <Page size="full">
      <div className="grid gap-3 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <LabSettingsSidebar selectedSection={selectedSection} onSelect={setSelectedSection} />
        <section className="grid min-w-0 gap-3">
            <PageHeader title={getLabSettingsSectionLabel(selectedSection)} description={sectionDescriptions[selectedSection]} />
            <Card className="gap-3">
              {settingsQuery.isPending && <FormLoading label="Loading lab settings" />}
              {settingsQuery.isError && (
                <div role="alert" className="grid gap-2">
                  <p>{getApiErrorMessage(settingsQuery.error, 'Unable to load lab settings.')}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-fit"
                    onClick={() => void settingsQuery.refetch()}
                  >
                    Retry
                  </Button>
                </div>
              )}
              {settings && selectedSection === 'operations' && (
                <LabOperationsForm
                  settings={settings}
                  onChange={updateSettings}
                  onSave={() => void saveSection()}
                  isSaving={saveSettings.isPending}
                />
              )}
              {settings && selectedSection === 'notifications' && (
                <LabNotificationsForm
                  settings={settings}
                  onChange={updateSettings}
                  onSave={() => void saveSection()}
                  isSaving={saveSettings.isPending}
                />
              )}
            </Card>
        </section>
      </div>
    </Page>
  )
}
