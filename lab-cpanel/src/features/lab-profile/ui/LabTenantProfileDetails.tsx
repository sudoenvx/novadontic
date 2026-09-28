import { useId, useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'

import type { LabTenantProfile } from '../domain/labTenantProfile'
import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card, CardHeader, CardTitle } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'

type BusinessDetails = Pick<
  LabTenantProfile,
  'legalName' | 'licenseNumber' | 'taxId' | 'phoneNumber' | 'registeredAddress' | 'email' | 'website'
>

type LabTenantProfileDetailsProps = {
  profile: LabTenantProfile
  onSaveBusinessDetails: (details: BusinessDetails) => void
  onRequestAction: (action: string) => void
}

export function LabTenantProfileDetails({
  profile,
  onSaveBusinessDetails,
  onRequestAction,
}: LabTenantProfileDetailsProps) {
  return (
    <div className="grid min-w-0 content-start gap-3">
      <BusinessDetailsCard profile={profile} onSave={onSaveBusinessDetails} />
      <SubscriptionCard profile={profile} onRequestAction={onRequestAction} />
      <AccountDetailsCard profile={profile} />
      <DangerZoneCard onRequestAction={onRequestAction} />
    </div>
  )
}

function BusinessDetailsCard({
  profile,
  onSave,
}: {
  profile: LabTenantProfile
  onSave: (details: BusinessDetails) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<BusinessDetails>(() => getBusinessDetails(profile))

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave(draft)
    setEditing(false)
  }

  function beginEditing() {
    setDraft(getBusinessDetails(profile))
    setEditing(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Business details</CardTitle>
        <Button
          type="button"
          variant="neutral"
          size="sm"
          onClick={editing ? () => setEditing(false) : beginEditing}
        >
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </CardHeader>
      {editing ? (
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <ProfileField label="Legal name" value={draft.legalName} onChange={(value) => setDraft({ ...draft, legalName: value })} />
          <ProfileField label="License number" value={draft.licenseNumber} onChange={(value) => setDraft({ ...draft, licenseNumber: value })} />
          <ProfileField label="Tax ID" value={draft.taxId} onChange={(value) => setDraft({ ...draft, taxId: value })} />
          <ProfileField label="Phone" value={draft.phoneNumber} onChange={(value) => setDraft({ ...draft, phoneNumber: value })} />
          <ProfileField className="md:col-span-2" label="Registered address" value={draft.registeredAddress} onChange={(value) => setDraft({ ...draft, registeredAddress: value })} />
          <ProfileField label="Email" type="email" value={draft.email} onChange={(value) => setDraft({ ...draft, email: value })} />
          <ProfileField label="Website" type="url" value={draft.website} onChange={(value) => setDraft({ ...draft, website: value })} />
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="neutral" onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      ) : (
        <div className="grid gap-x-8 md:grid-cols-2">
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

function SubscriptionCard({
  profile,
  onRequestAction,
}: {
  profile: LabTenantProfile
  onRequestAction: (action: string) => void
}) {
  return (
    <Card>
      <CardHeader className="flex flex-wrap flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Subscription</CardTitle>
          <p className="mt-1 max-w-xl text-sm text-text-secondary">{profile.planSummary}</p>
        </div>
        <Badge tone="success">{profile.planStatus}</Badge>
      </CardHeader>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border-soft pb-3">
        <div>
          <p className="text-lg font-bold text-text-primary">{profile.planName}</p>
          <p className="text-sm text-text-secondary">{profile.planRenewal}</p>
        </div>
        <p className="text-end">
          <span className="text-lg font-bold text-text-primary">{profile.planPrice}</span>
          <span className="ms-1 text-sm text-text-secondary">{profile.planInterval}</span>
        </p>
      </div>
      <dl className="grid gap-x-5 sm:grid-cols-2">
        <div className="border-b border-border-soft py-2 sm:border-b-0 sm:border-e sm:pe-4">
          <dt className="text-xs font-semibold text-text-secondary">Storage used</dt>
          <dd className="mt-1 text-lg font-bold text-text-primary tabular">{profile.storageUsedGb} GB</dd>
          <p className="text-xs text-text-secondary">Billed by actual usage</p>
        </div>
        <div className="py-2">
          <dt className="text-xs font-semibold text-text-secondary">Storage pricing</dt>
          <dd className="mt-1 text-lg font-bold text-text-primary">{profile.storageRate}</dd>
          <p className="text-xs text-text-secondary">Charged per gigabyte</p>
        </div>
      </dl>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-soft pt-2">
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-secondary">
          {profile.planFeatures.map((feature) => (
            <li key={feature} className="inline-flex items-center gap-1">
              <Check size={14} aria-hidden="true" className="text-success" />
              {feature}
            </li>
          ))}
        </ul>
        <Button type="button" variant="neutral" size="sm" onClick={() => onRequestAction('Plan management')}>
          Manage plan
        </Button>
      </div>
    </Card>
  )
}

function AccountDetailsCard({ profile }: { profile: LabTenantProfile }) {
  const details = [
    ['Tenant ID', profile.tenantId],
    ['Created', profile.createdAt],
    ['Subdomain', profile.subdomain],
    ['Custom domain', profile.customDomain],
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account details</CardTitle>
      </CardHeader>
      <dl className="grid">
        {details.map(([label, value]) => (
          <div key={label} className="grid gap-2 border-b border-border-soft py-2 last:border-b-0 sm:grid-cols-[12rem_minmax(0,1fr)]">
            <dt className="text-sm text-text-secondary">{label}</dt>
            <dd className="wrap-break-word text-sm text-text-primary">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

function DangerZoneCard({ onRequestAction }: { onRequestAction: (action: string) => void }) {
  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
      </CardHeader>
      <DangerAction
        title="Suspend account"
        description="Pauses staff and doctor access. Cases already in production are preserved."
        onClick={() => onRequestAction('Account suspension')}
      />
      <DangerAction
        title="Export all data"
        description="Download every case, patient record, doctor and invoice as a single archive."
        onClick={() => onRequestAction('Full data export')}
      />
      <DangerAction
        title="Close account"
        description="Permanently closes this account after the data retention window."
        onClick={() => onRequestAction('Account closure')}
      />
    </Card>
  )
}

function DangerAction({
  title,
  description,
  onClick,
}: {
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft py-2 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="max-w-2xl text-sm text-text-secondary">{description}</p>
      </div>
      <Button type="button" variant="danger" size="sm" onClick={onClick}>{title}</Button>
    </div>
  )
}

function ReadOnlyField({
  className,
  label,
  value,
}: {
  className?: string
  label: string
  value: string
}) {
  return (
    <div className={className}>
      <div className="border-b border-border-soft py-2">
        <p className="text-xs font-semibold text-text-secondary">{label}</p>
        <p className="mt-1 wrap-break-word text-sm font-medium text-text-primary">{value}</p>
      </div>
    </div>
  )
}

function ProfileField({
  className,
  label,
  type = 'text',
  value,
  onChange,
}: {
  className?: string
  label: string
  type?: 'text' | 'email' | 'url'
  value: string
  onChange: (value: string) => void
}) {
  const id = useId()

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} className="mt-1" value={value} onChange={(event) => onChange(event.currentTarget.value)} />
    </div>
  )
}

function getBusinessDetails(profile: LabTenantProfile): BusinessDetails {
  const { legalName, licenseNumber, taxId, phoneNumber, registeredAddress, email, website } = profile
  return { legalName, licenseNumber, taxId, phoneNumber, registeredAddress, email, website }
}