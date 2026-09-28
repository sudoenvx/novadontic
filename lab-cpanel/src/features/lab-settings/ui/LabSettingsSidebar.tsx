import { Bell, Settings2 } from 'lucide-react'

import { getLabSettingsSectionLabel, type LabSettingsSection } from '../domain/labSettings'

const sections: { id: LabSettingsSection; icon: typeof Settings2 }[] = [
  { id: 'operations', icon: Settings2 },
  { id: 'notifications', icon: Bell },
]

export function LabSettingsSidebar({ selectedSection, onSelect }: { selectedSection: LabSettingsSection; onSelect: (section: LabSettingsSection) => void }) {
  return (
    <aside className="grid h-fit gap-1 rounded-md bg-surface p-2 border border-border">
      <div className="px-1 mb-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Lab settings</p>
        <p className="mt-1 text-xs text-text-muted">Manage your workspace.</p>
      </div>
      <nav className="grid gap-1" aria-label="Lab settings sections">
        {sections.map(({ icon: Icon, id }) => (
          <button
            key={id}
            type="button"
            className={`flex items-center gap-2 rounded-sm px-2 py-1 text-start text-sm font-medium transition-colors ${selectedSection === id ? 'bg-secondary text-secondary-foreground' : 'text-secondary hover:bg-neutral-100 hover:text-text'}`}
            onClick={() => onSelect(id)}
            aria-current={selectedSection === id ? 'page' : undefined}
          >
            <Icon size={16} aria-hidden="true" />
            {getLabSettingsSectionLabel(id)}
          </button>
        ))}
      </nav>
    </aside>
  )
}
