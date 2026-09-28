import {
  Building2,
  Download,
  GitBranch,
  HardDrive,
  Layers3,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

import type { LabTenantProfile } from '../domain/labTenantProfile'
import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { StatisticCard } from '../../../shared/ui/StatisticCard'

type LabTenantProfileOverviewProps = {
  profile: LabTenantProfile
  onExport: () => void
  onManageSubscription: () => void
}

const metricIcons: Record<string, LucideIcon> = {
  Doctors: UsersRound,
  'Clinics / portals': Building2,
  Branch: GitBranch,
  'Cases this cycle': Layers3,
  'Storage used': HardDrive,
}

export function LabTenantProfileOverview({
  profile,
  onExport,
  onManageSubscription,
}: LabTenantProfileOverviewProps) {
  return (
    <>
      <Card className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
            <Building2 size={23} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="wrap-break-word text-xl font-extrabold leading-tight text-text-primary">
              {profile.labName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge tone="success">{profile.planStatus}</Badge>
              <Badge tone="info">{profile.planName}</Badge>
              <span className="wrap-break-word text-sm text-text-secondary">{profile.subdomain}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <Button type="button" variant="neutral" size="sm" onClick={onExport}>
            <Download aria-hidden="true" />
            Export data
          </Button>
          <Button type="button" size="sm" onClick={onManageSubscription}>
            Manage subscription
          </Button>
        </div>
      </Card>
      <section className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5" aria-label="Lab account overview">
        {profile.metrics.map((metric) => {
          const Icon = metricIcons[metric.label]
          return (
            <StatisticCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              icon={Icon ? <Icon size={17} aria-hidden="true" /> : undefined}
            />
          )
        })}
      </section>
    </>
  )
}