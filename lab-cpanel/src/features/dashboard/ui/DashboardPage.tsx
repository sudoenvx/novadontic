import { useState } from 'react'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  Layers3,
} from 'lucide-react'

import { Card, CardDescription, CardHeader, CardTitle } from '../../../shared/ui/Card'
import {
  FilterTab,
  FilterTabs,
  FilterTabsList,
} from '../../../shared/ui/FilterTabs'
import { Page } from '../../../shared/ui/Page'
import { StatisticCard } from '../../../shared/ui/StatisticCard'
import { DashboardCaseTable } from './DashboardCaseTable'
import {
  countCasesByType,
  filterCasesByType,
} from '../domain/case'
import { applianceFixtures } from '../data/appliances'
import { caseFixtures } from '../data/cases'

export function DashboardPage() {
  const [selectedCaseType, setSelectedCaseType] = useState('all')

  const caseCounts = countCasesByType(caseFixtures)
  const visibleCases = filterCasesByType(caseFixtures, selectedCaseType)

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

      <section className="grid gap-3 max-lg:grid-cols-1">
        <Card size="sm">
          <CardHeader>
            <div className="col gap-0">
              <CardTitle>Orthodontic Cases</CardTitle>
              <CardDescription>
                Track active lab cases by appliance type and stage.
              </CardDescription>
            </div>
          </CardHeader>

          <FilterTabs
            value={selectedCaseType}
            onValueChange={setSelectedCaseType}
            aria-label="Filter cases by type"
          >
            <FilterTabsList>
              <FilterTab value="all" count={caseFixtures.length}>
                All
              </FilterTab>
              {applianceFixtures.map((appliance) => (
                <FilterTab
                  key={appliance.name}
                  value={appliance.name}
                  count={caseCounts[appliance.name] ?? 0}
                  color={appliance.color}
                >
                  {appliance.name}
                </FilterTab>
              ))}
            </FilterTabsList>
          </FilterTabs>
        </Card>

        <DashboardCaseTable cases={visibleCases} />
      </section>

    </Page>
  )
}
