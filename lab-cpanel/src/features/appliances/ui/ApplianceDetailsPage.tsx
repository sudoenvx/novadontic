import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { Page } from '../../../shared/ui/Page'
import { toast } from '../../../shared/ui/Toast'
import { appliances } from '../data/appliances'
import { getApplianceFieldCount, getApplianceGroupCount, isApplianceNameAvailable, type Appliance, type ApplianceField } from '../domain/appliance'
import { ApplianceFieldDialog } from './ApplianceFieldDialog'
import { FieldGroupDialog } from './FieldGroupDialog'

type ApplianceLocationState = { appliance?: Appliance }

function createId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

export function ApplianceDetailsPage() {
  const navigate = useNavigate()
  const { applianceId } = useParams()
  const location = useLocation()
  const locationState = location.state as ApplianceLocationState | null
  const initialAppliance = locationState?.appliance ?? appliances.find((item) => item.id === applianceId)
  const [appliance, setAppliance] = useState<Appliance | undefined>(initialAppliance)
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false)
  const [fieldGroupId, setFieldGroupId] = useState<string>()
  const [editingField, setEditingField] = useState<ApplianceField>()
  const [isRenaming, setIsRenaming] = useState(false)
  const [name, setName] = useState(initialAppliance?.name ?? '')

  if (!appliance) {
    return (
      <Page size="full">
        <Card className="items-start gap-3 p-6">
          <p className="font-medium text-text">Appliance type not found</p>
          <Button onClick={() => navigate('/appliances')}><ArrowLeft /> Back to appliances</Button>
        </Card>
      </Page>
    )
  }

  const selectedAppliance = appliance

  function updateAppliance(update: (current: Appliance) => Appliance) {
    setAppliance((current) => current ? update(current) : current)
  }

  function handleAddGroup(groupName: string) {
    updateAppliance((current) => ({ ...current, groups: [...current.groups, { id: createId('group'), name: groupName, fields: [] }] }))
    toast.add({ title: 'Field group added', type: 'success' })
  }

  function handleSaveField(groupId: string, field: ApplianceField) {
    updateAppliance((current) => ({
      ...current,
      groups: current.groups.map((group) => {
        const fields = editingField ? group.fields.filter((item) => item.id !== field.id) : group.fields
        return group.id === groupId ? { ...group, fields: [...fields, field] } : { ...group, fields }
      }),
    }))
    toast.add({ title: editingField ? 'Field updated' : 'Field added', description: `${field.label} is now part of ${selectedAppliance.name}.`, type: 'success' })
    setEditingField(undefined)
  }

  function handleDeleteField(groupId: string, fieldId: string) {
    updateAppliance((current) => ({ ...current, groups: current.groups.map((group) => group.id === groupId ? { ...group, fields: group.fields.filter((field) => field.id !== fieldId) } : group) }))
    toast.add({ title: 'Field removed', type: 'success' })
  }

  function handleDeleteGroup(groupId: string) {
    const group = selectedAppliance.groups.find((item) => item.id === groupId)
    updateAppliance((current) => ({ ...current, groups: current.groups.filter((item) => item.id !== groupId) }))
    toast.add({ title: 'Field group removed', description: group?.name, type: 'success' })
  }

  function handleRename(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextName = name.trim()
    if (!nextName || !isApplianceNameAvailable(appliances, nextName, selectedAppliance.id)) {
      toast.add({ title: 'Name is not available', description: 'Choose a unique appliance name.', type: 'error' })
      return
    }
    updateAppliance((current) => ({ ...current, name: nextName }))
    setIsRenaming(false)
    toast.add({ title: 'Appliance renamed', type: 'success' })
  }

  return (
    <Page size="full">
      <Button variant="ghost" className="w-fit" onClick={() => navigate('/appliances')}><ArrowLeft /> Appliances &amp; fields</Button>
      <Card className="gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-md text-2xl" style={{ backgroundColor: appliance.color }} aria-hidden="true">{appliance.icon}</span>
            <div>
              {isRenaming ? (
                <form className="flex items-center gap-2" onSubmit={handleRename}>
                  <Input value={name} onChange={(event) => setName(event.target.value)} aria-label="Appliance name" autoFocus />
                  <Button type="submit" size="sm">Save</Button>
                  <Button type="button" variant="neutral" size="sm" onClick={() => setIsRenaming(false)}>Cancel</Button>
                </form>
              ) : (
                <h1 className="text-lg font-semibold text-text">{appliance.name}</h1>
              )}
              <p className="text-sm text-text-muted">{appliance.source} · visible to every lab</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={appliance.isActive}
              aria-label={`${appliance.isActive ? 'Deactivate' : 'Activate'} ${appliance.name}`}
              onClick={() => updateAppliance((current) => ({ ...current, isActive: !current.isActive }))}
              className={`relative h-6 w-10 rounded-full p-0.5 ${appliance.isActive ? 'bg-primary' : 'bg-surface-muted'}`}
            >
              <span className={`block size-5 rounded-full bg-surface transition-transform ${appliance.isActive ? 'translate-x-4' : ''}`} />
            </button>
            {!isRenaming && <Button variant="neutral" onClick={() => setIsRenaming(true)}>Rename</Button>}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text">
          <span><strong>{getApplianceGroupCount(appliance)}</strong> field groups</span>
          <span><strong>{getApplianceFieldCount(appliance)}</strong> fields</span>
          <span><strong>{appliance.casesUsing}</strong> cases using this type</span>
        </div>
      </Card>

      <Card className="gap-3 p-3 md:p-5">
        {appliance.groups.map((group) => (
          <section key={group.id} className="overflow-hidden rounded-md border border-border">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-muted px-4 py-3">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-text">{group.name}</h2>
                <span className="text-xs text-text-muted">{group.fields.length} {group.fields.length === 1 ? 'field' : 'fields'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => { setEditingField(undefined); setFieldGroupId(group.id); setIsFieldDialogOpen(true) }}><Plus /> Add field</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteGroup(group.id)}><Trash2 /> Delete</Button>
              </div>
            </div>
            <div>
              {group.fields.length > 0 ? group.fields.map((field) => (
                <div key={field.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Badge tone={field.type === 'multiselect' ? 'warning' : 'info'}>{field.type}</Badge>
                    <div className="min-w-0">
                      <p className="font-medium text-text">{field.label} {field.required && <span className="text-destructive">*</span>}</p>
                      <p className="font-mono text-2xs text-text-muted">{field.key}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs text-text-muted">
                      <p>Default: {field.defaultValue || '—'}</p>
                      {field.dependsOn && <p className="mt-1">Depends on: {field.dependsOn}{field.dependsOnValue ? ` = ${field.dependsOnValue}` : ''}</p>}
                      {field.options.length > 0 && <p className="mt-1">{field.options.length} options</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon-sm" variant="ghost" aria-label={`Edit ${field.label}`} onClick={() => { setEditingField(field); setFieldGroupId(group.id); setIsFieldDialogOpen(true) }}><Pencil /></Button>
                      <Button size="icon-sm" variant="ghost" className="text-destructive" aria-label={`Delete ${field.label}`} onClick={() => handleDeleteField(group.id, field.id)}><Trash2 /></Button>
                    </div>
                  </div>
                </div>
              )) : <p className="px-4 py-6 text-sm text-text-muted">No fields yet. Add the first field to this group.</p>}
            </div>
          </section>
        ))}
        {appliance.groups.length === 0 && <p className="py-8 text-center text-sm text-text-muted">Start by creating a field group.</p>}
        <Button variant="neutral" className="w-fit" onClick={() => setIsGroupDialogOpen(true)}><Plus /> Add field group</Button>
      </Card>

      <FieldGroupDialog
        open={isGroupDialogOpen}
        onOpenChange={setIsGroupDialogOpen}
        onCreate={handleAddGroup}
        isNameAvailable={(groupName) => !appliance.groups.some((group) => group.name.toLowerCase() === groupName.trim().toLowerCase())}
      />
      <ApplianceFieldDialog
        key={editingField?.id ?? fieldGroupId ?? 'new-field'}
        open={isFieldDialogOpen}
        onOpenChange={setIsFieldDialogOpen}
        appliance={appliance}
        groups={appliance.groups}
        initialGroupId={fieldGroupId}
        field={editingField}
        onSave={handleSaveField}
      />
    </Page>
  )
}
