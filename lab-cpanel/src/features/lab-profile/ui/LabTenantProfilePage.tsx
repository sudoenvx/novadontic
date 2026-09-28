import { useState, type FormEvent } from 'react'
import { Building2, Check, FileCheck, Upload } from 'lucide-react'

import { labTenantProfile as initialProfile } from '../data/labTenantProfile'
import type { LabTenantProfile } from '../domain/labTenantProfile'
import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card, CardHeader, CardTitle } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import { toast } from '../../../shared/ui/Toast'
import { Page } from '../../../shared/ui/Page'

export function LabTenantProfilePage() {
  const [profile, setProfile] = useState<LabTenantProfile>(initialProfile)

  function updateProfile(changes: Partial<LabTenantProfile>) {
    setProfile((current) => ({ ...current, ...changes }))
  }

  function handleExport() {
    toast.add({ title: 'Account export requested', description: 'Your account data archive is being prepared.', type: 'info' })
  }

  function handleComplianceUpload(requirementId: string) {
    setProfile((current) => ({
      ...current,
      complianceRequirements: current.complianceRequirements.map((requirement) =>
        requirement.id === requirementId
          ? {
              ...requirement,
              isProvided: true,
              fileName: `${requirement.id}.pdf`,
              uploadedAt: 'Just now',
            }
          : requirement,
      ),
    }))
    toast.add({ title: 'Compliance document uploaded', type: 'success' })
  }

  return (
    <Page size="full">
      <div className="grid gap-3">
        <TenantHeader profile={profile} onExport={handleExport} />
        <TenantMetrics profile={profile} />
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid min-w-0 gap-3">
            <BusinessDetailsCard profile={profile} onSave={updateProfile} />
            <SubscriptionCard profile={profile} />
            <AccountDetailsCard profile={profile} />
            <DangerZoneCard />
          </div>
          <div className="grid min-w-0 content-start gap-3">
            <AccountOwnerCard profile={profile} />
            <ComplianceCard profile={profile} onUpload={handleComplianceUpload} />
            <AccountActivityCard profile={profile} />
          </div>
        </div>
      </div>
    </Page>
  )
}

function TenantHeader({ profile, onExport }: { profile: LabTenantProfile; onExport: () => void }) {
  return (
    <Card className="gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
          <Building2 size={24} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-text">{profile.labName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge tone="success">{profile.planStatus}</Badge>
            <Badge tone="info">{profile.planName}</Badge>
            <span className="text-sm text-text-muted">{profile.subdomain}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="neutral" onClick={onExport}>Export account data</Button>
        <Button onClick={() => toast.add({ title: 'Subscription management', description: 'Subscription management is ready to connect.', type: 'info' })}>
          Manage subscription
        </Button>
      </div>
    </Card>
  )
}

function TenantMetrics({ profile }: { profile: LabTenantProfile }) {
  return (
    <Card className="grid grid-cols-2 gap-0 p-0 sm:grid-cols-3 lg:grid-cols-6">
      {profile.metrics.map((metric) => (
        <div key={metric.label} className="border-border-soft px-3 py-2 first:rounded-l-md sm:border-r last:border-r-0">
          <p className="text-lg font-semibold text-primary">{metric.value}</p>
          <p className="text-2xs font-medium uppercase tracking-wide text-text-muted">{metric.label}</p>
        </div>
      ))}
    </Card>
  )
}

function BusinessDetailsCard({ profile, onSave }: { profile: LabTenantProfile; onSave: (changes: Partial<LabTenantProfile>) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile)

  function updateDraft(key: keyof LabTenantProfile, value: string) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      legalName: draft.legalName,
      licenseNumber: draft.licenseNumber,
      taxId: draft.taxId,
      phoneNumber: draft.phoneNumber,
      registeredAddress: draft.registeredAddress,
      email: draft.email,
      website: draft.website,
    })
    setEditing(false)
    toast.add({ title: 'Business details updated', type: 'success' })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="normal-case">Business details</CardTitle>
        <Button variant="neutral" onClick={() => { setDraft(profile); setEditing((current) => !current) }}>
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </CardHeader>
      {editing ? (
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <ProfileField label="Legal name" value={draft.legalName} onChange={(value) => updateDraft('legalName', value)} />
          <ProfileField label="License number" value={draft.licenseNumber} onChange={(value) => updateDraft('licenseNumber', value)} />
          <ProfileField label="Tax ID" value={draft.taxId} onChange={(value) => updateDraft('taxId', value)} />
          <ProfileField label="Phone" value={draft.phoneNumber} onChange={(value) => updateDraft('phoneNumber', value)} />
          <ProfileField className="md:col-span-2" label="Registered address" value={draft.registeredAddress} onChange={(value) => updateDraft('registeredAddress', value)} />
          <ProfileField label="Email" value={draft.email} onChange={(value) => updateDraft('email', value)} />
          <ProfileField label="Website" value={draft.website} onChange={(value) => updateDraft('website', value)} />
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="neutral" onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <ReadOnlyField label="Legal name" value={profile.legalName} />
          <ReadOnlyField label="License number" value={profile.licenseNumber} />
          <ReadOnlyField label="Tax ID" value={profile.taxId} />
          <ReadOnlyField label="Phone" value={profile.phoneNumber} />
          <ReadOnlyField className="md:col-span-2" label="Registered address" value={profile.registeredAddress} />
          <ReadOnlyField label="Email" value={profile.email} />
          <ReadOnlyField label="Website" value={profile.website} />
        </div>
      )}
    </Card>
  )
}

function SubscriptionCard({ profile }: { profile: LabTenantProfile }) {
  return (
    <Card>
      <CardHeader className="flex flex-wrap flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="normal-case">Subscription</CardTitle>
          <p className="mt-1 max-w-xl text-sm text-text-muted">{profile.planSummary}</p>
        </div>
        <Badge tone="success">{profile.planStatus}</Badge>
      </CardHeader>
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-sm bg-neutral-100 px-3 py-2">
        <div>
          <p className="text-lg font-semibold text-primary">{profile.planName}</p>
          <p className="text-sm text-text-muted">{profile.planRenewal}</p>
        </div>
        <p className="text-end"><span className="text-lg font-semibold text-text">{profile.planPrice}</span><span className="ml-1 text-sm text-text-muted">{profile.planInterval}</span></p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-sm bg-neutral-100 px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Storage used</p>
          <p className="mt-1 text-lg font-semibold text-text">{profile.storageUsedGb} GB</p>
          <p className="text-xs text-text-muted">Charged at {profile.storageRate}</p>
        </div>
        <div className="rounded-sm bg-neutral-100 px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Storage pricing</p>
          <p className="mt-1 text-lg font-semibold text-text">{profile.storageRate}</p>
          <p className="text-xs text-text-muted">Billed by actual usage</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-soft pt-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-secondary">
          {profile.planFeatures.map((feature) => <span key={feature} className="inline-flex items-center gap-1"><Check size={13} className="text-success" />{feature}</span>)}
        </div>
        <Button variant="neutral" onClick={() => toast.add({ title: 'Plan details', description: 'Plan management is ready to connect.', type: 'info' })}>View plan details</Button>
      </div>
    </Card>
  )
}

function AccountOwnerCard({ profile }: { profile: LabTenantProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case">Account owner</CardTitle>
      </CardHeader>
      <div className="flex items-center gap-2">
        <span className="grid size-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {profile.accountOwner.initials}
        </span>
        <div>
          <p className="font-semibold text-text">{profile.accountOwner.name}</p>
          <p className="text-sm text-text-muted">{profile.accountOwner.email}</p>
        </div>
      </div>
      <Button variant="neutral" className="w-full">Transfer ownership</Button>
      <Button variant="neutral" className="w-full">Manage full team</Button>
    </Card>
  )
}

function ComplianceCard({ profile, onUpload }: { profile: LabTenantProfile; onUpload: (requirementId: string) => void }) {
  const missingCount = profile.complianceRequirements.filter((requirement) => !requirement.isProvided).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="normal-case">Compliance documents</CardTitle>
          <p className="mt-1 text-sm text-text-muted">Required files configured by your platform administrator.</p>
        </div>
        <Badge tone={missingCount > 0 ? 'warning' : 'success'}>{missingCount > 0 ? `${missingCount} needed` : 'Complete'}</Badge>
      </CardHeader>
      <div className="grid gap-2">
        {profile.complianceRequirements.map((requirement) => (
          <div key={requirement.id} className="flex items-start gap-2 rounded-sm bg-neutral-100 px-2 py-2">
            <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-xs ${requirement.isProvided ? 'bg-success-soft text-success-soft-foreground' : 'bg-warning-soft text-warning-soft-foreground'}`}>
              {requirement.isProvided ? <FileCheck size={15} /> : <Upload size={15} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-sm font-semibold text-text">{requirement.name}</p>
                <Badge tone={requirement.isProvided ? 'success' : 'warning'}>{requirement.isProvided ? 'Provided' : 'Needed'}</Badge>
              </div>
              <p className="text-xs text-text-muted">{requirement.isProvided ? `${requirement.fileName} - ${requirement.uploadedAt}` : requirement.description}</p>
              {requirement.expiresAt && <p className="text-xs text-text-muted">{requirement.expiresAt}</p>}
            </div>
            <Button variant="neutral" size="xs" onClick={() => onUpload(requirement.id)}>{requirement.isProvided ? 'Replace' : 'Upload'}</Button>
          </div>
        ))}
      </div>
    </Card>
  )
}

function AccountDetailsCard({ profile }: { profile: LabTenantProfile }) {
  const details = [['Tenant ID', profile.tenantId], ['Created', profile.createdAt], ['Subdomain', profile.subdomain], ['Custom domain', profile.customDomain]]
  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case">Account details</CardTitle>
      </CardHeader>
      <div className="grid">
        {details.map(([label, value]) => (
          <div key={label} className="grid gap-2 border-b border-border-soft py-1.5 last:border-0 sm:grid-cols-[12rem_1fr]">
            <span className="text-sm text-text-muted">{label}</span>
            <span className="text-sm text-text">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function AccountActivityCard({ profile }: { profile: LabTenantProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case">Account activity</CardTitle>
      </CardHeader>
      <div className="grid gap-3">
        {profile.activity.map((item) => (
          <div key={`${item.action}-${item.date}`} className="flex items-start gap-2">
            <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><Check size={12} /></span>
            <div>
              <p className="text-sm text-text">{item.action}</p>
              <p className="text-xs text-text-muted">{item.actor} - {item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function DangerZoneCard() {
  return (
    <Card className="ring-1 ring-inset ring-destructive/30">
      <CardHeader>
        <CardTitle className="normal-case text-destructive">Danger zone</CardTitle>
      </CardHeader>
      <DangerAction title="Suspend account" description="Pauses all staff and doctor access. Cases already in production are preserved and can be resumed." action="Suspend" />
      <DangerAction title="Export all data" description="Download every case, patient record, doctor and invoice as a single archive." action="Export" />
      <DangerAction title="Close account" description="Permanently closes this account after a 30-day data retention window." action="Close account" />
    </Card>
  )
}

function DangerAction({ title, description, action }: { title: string; description: string; action: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-destructive/20 py-2 last:border-0">
      <div>
        <p className="text-sm font-semibold text-text">{title}</p>
        <p className="max-w-2xl text-sm text-text-muted">{description}</p>
      </div>
      <Button variant="destructive">{action}</Button>
    </div>
  )
}

function ReadOnlyField({ className, label, value }: { className?: string; label: string; value: string }) {
  return (
    <div className={className}>
      <p className="text-2xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 rounded-sm bg-neutral-100 px-2 py-1 text-sm text-text">{value}</p>
    </div>
  )
}

function ProfileField({ className, label, value, onChange }: { className?: string; label: string; value: string; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="mt-1" value={value} onChange={(event) => onChange(event.currentTarget.value)} />
    </div>
  )
}
