import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  Layers3,
} from 'lucide-react'

import { Page } from '../../../shared/ui/Page'
import { StatisticCard } from '../../../shared/ui/StatisticCard'
import { DashboardCaseTable } from './DashboardCaseTable'
import { caseFixtures } from '../data/cases'

export function DashboardPage() {
  return (
    <Page>
      <section
        className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        aria-label="Dashboard statistics"
      >
        <StatisticCard
          label="Active cases"
          value="48"
          icon={<BriefcaseBusiness size={20} />}
          featured
        />
        <StatisticCard
          label="Due today"
          value="12"
          icon={<CalendarClock size={20} />}
          tone="destructive"
        />
        <StatisticCard
          label="In production"
          value="18"
          icon={<Layers3 size={20} />}
        />
        <StatisticCard
          label="Completed this month"
          value="126"
          icon={<ArrowUpRight size={20} />}
        />
      </section>

      <section className="grid gap-3">
        <DashboardCaseTable cases={caseFixtures} />
      </section>

    </Page>
  )
}
