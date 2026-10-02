import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  Layers3,
} from 'lucide-react'
import { useMemo } from 'react'

import { getApiErrorMessage } from '../../../shared/api/apiError'
import { PageLoading } from '../../../shared/ui/Loading'
import { Page } from '../../../shared/ui/Page'
import { StatisticCard } from '../../../shared/ui/StatisticCard'
import { useCases } from '../../case-pipeline'
import { mapCasePipelineCaseToDashboardCase } from '../api/mapCasePipelineCaseToDashboardCase'
import { DashboardCaseTable } from './DashboardCaseTable'

export function DashboardPage() {
  const casesQuery = useCases()
  const cases = casesQuery.data ?? []
  const dashboardCases = useMemo(
    () => (casesQuery.data ?? []).map(mapCasePipelineCaseToDashboardCase),
    [casesQuery.data],
  )
  const activeCount = cases.filter((caseItem) =>
    caseItem.productionSteps.length === 0 ||
    caseItem.productionSteps.some((step) => step.status !== 'completed'),
  ).length
  const dueTodayCount = cases.filter((caseItem) => caseItem.status === 'Due today').length
  const inProductionCount = cases.filter((caseItem) =>
    caseItem.productionSteps.some((step) => step.status === 'active'),
  ).length
  const deliveredCount = cases.filter((caseItem) =>
    caseItem.productionSteps.length > 0 &&
    caseItem.productionSteps.every((step) => step.status === 'completed'),
  ).length

  return (
    <Page>
      {casesQuery.isPending ? (
        <PageLoading label="Loading dashboard cases" />
      ) : casesQuery.isError ? (
        <p role="alert" className="rounded-md bg-surface px-4 py-6 text-sm text-destructive">
          Could not load dashboard cases: {getApiErrorMessage(casesQuery.error, 'Please try again.')}
        </p>
      ) : (
        <>
          <section
            className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            aria-label="Dashboard statistics"
          >
            <StatisticCard
              label="Active cases"
              value={String(activeCount)}
              icon={<BriefcaseBusiness size={20} />}
              featured
            />
            <StatisticCard
              label="Due today"
              value={String(dueTodayCount)}
              icon={<CalendarClock size={20} />}
              tone="destructive"
            />
            <StatisticCard
              label="In production"
              value={String(inProductionCount)}
              icon={<Layers3 size={20} />}
            />
            <StatisticCard
              label="Delivered cases"
              value={String(deliveredCount)}
              icon={<ArrowUpRight size={20} />}
            />
          </section>

          <section className="grid gap-3">
            <DashboardCaseTable cases={dashboardCases} />
          </section>
        </>
      )}
    </Page>
  )
}
