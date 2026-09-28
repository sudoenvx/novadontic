import { useState } from 'react'

import { Card } from '../../../shared/ui/Card'
import { AppHeader } from '../../../shared/ui/AppHeader'
import { Page } from '../../../shared/ui/Page'
import { toast } from '../../../shared/ui/Toast'
import { labSettings as initialSettings } from '../data/labSettings'
import { getLabSettingsSectionLabel, type LabSettings, type LabSettingsSection } from '../domain/labSettings'
import { LabNotificationsForm } from './LabNotificationsForm'
import { LabOperationsForm } from './LabOperationsForm'
import { LabSettingsSidebar } from './LabSettingsSidebar'

const sectionDescriptions: Record<LabSettingsSection, string> = {
  operations: 'Control the access rules that shape how clinics submit work.',
  notifications: 'Choose which events should reach your lab team by email.',
}

export function LabSettingsPage() {
  const [settings, setSettings] = useState<LabSettings>(initialSettings)
  const [selectedSection, setSelectedSection] = useState<LabSettingsSection>('operations')

  function updateSettings(changes: Partial<LabSettings>) {
    setSettings((current) => ({ ...current, ...changes }))
  }

  function saveSection() {
    toast.add({
      title: `${getLabSettingsSectionLabel(selectedSection)} updated`,
      description: 'Your lab settings have been saved.',
      type: 'success',
    })
  }

  return (
    <Page size="full">
      <div className="grid gap-3 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <LabSettingsSidebar selectedSection={selectedSection} onSelect={setSelectedSection} />
        <section className="grid min-w-0 gap-3">
            <AppHeader title={getLabSettingsSectionLabel(selectedSection)} description={sectionDescriptions[selectedSection]} />
            <Card className="gap-3">
              {selectedSection === 'operations' && <LabOperationsForm settings={settings} onChange={updateSettings} onSave={saveSection} />}
              {selectedSection === 'notifications' && <LabNotificationsForm settings={settings} onChange={updateSettings} onSave={saveSection} />}
            </Card>
        </section>
      </div>
    </Page>
  )
}
