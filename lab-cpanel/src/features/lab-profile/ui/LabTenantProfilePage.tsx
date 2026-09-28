import { useState } from 'react'

import { labTenantProfile as initialProfile } from '../data/labTenantProfile'
import type { LabTenantProfile } from '../domain/labTenantProfile'
import { toast } from '../../../shared/ui/Toast'
import { Page } from '../../../shared/ui/Page'
import { LabTenantProfileAccess } from './LabTenantProfileAccess'
import { LabTenantProfileDetails } from './LabTenantProfileDetails'
import { LabTenantProfileOverview } from './LabTenantProfileOverview'

export function LabTenantProfilePage() {
  const [profile, setProfile] = useState<LabTenantProfile>(initialProfile)

  function notifyUnavailable(action: string) {
    toast.add({
      title: `${action} isn't connected yet`,
      description: 'This account action is not available until account services are connected.',
      type: 'info',
    })
  }

  return (
    <Page size="lg">
      <div className="grid gap-page-gap">
        <LabTenantProfileOverview
          profile={profile}
          onExport={() => notifyUnavailable('Data export')}
          onManageSubscription={() => notifyUnavailable('Subscription management')}
        />
        <div className="grid min-w-0 gap-page-gap lg:grid-cols-[minmax(0,1fr)_var(--spacing-aside)]">
          <LabTenantProfileDetails
            profile={profile}
            onSaveBusinessDetails={(details) => {
              setProfile((current) => ({ ...current, ...details }))
              toast.add({ title: 'Business details updated', type: 'success' })
            }}
            onRequestAction={notifyUnavailable}
          />
          <LabTenantProfileAccess profile={profile} onRequestAction={notifyUnavailable} />
        </div>
      </div>
    </Page>
  )
}
