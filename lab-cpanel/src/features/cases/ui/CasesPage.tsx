import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '../../../shared/api/apiError'
import { Button } from '../../../shared/ui/Button'
import { DataTableFooter, DataTablePagination } from '../../../shared/ui/data-table'
import { PageLoading } from '../../../shared/ui/Loading'
import { PageHeader, PageHeaderActions } from '../../../shared/ui/PageHeader'
import { Page } from '../../../shared/ui/Page'
import { useCases } from '../../case-pipeline'
import { mapCasePipelineCaseToCaseListItem } from '../../case-pipeline/api/case.mapper'
import {
  emptyCaseListFilters,
  filterCaseList,
  type CaseListFilters,
  type CaseListItem,
} from '../domain/case'
import { CaseFilters } from './CaseFilters'
import { CasesTable } from './CasesTable'

export function CasesPage() {
  const navigate = useNavigate()
  const casesQuery = useCases()
  const [filters, setFilters] = useState<CaseListFilters>(emptyCaseListFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const cases = useMemo(
    () => (casesQuery.data ?? []).map(mapCasePipelineCaseToCaseListItem),
    [casesQuery.data],
  )
  const filteredCases = useMemo(() => filterCaseList(cases, filters), [cases, filters])
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize))
  const visibleCases = filteredCases.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const options = useMemo(() => ({
    appliances: getUniqueValues(cases, 'applianceType'),
    categories: getUniqueValues(cases, 'category'),
    stages: getUniqueValues(cases, 'stage'),
  }), [cases])

  function handleFilterChange(nextFilters: CaseListFilters) {
    setFilters(nextFilters)
    setCurrentPage(1)
  }

  return (
    <Page size="full" className="gap-3.5">
      <PageHeader
        title="Cases"
        description="Search, filter, and open every case moving through the lab."
      >
        <PageHeaderActions>
          <Button onClick={() => navigate('/cases/new')}>
            <Plus /> Create case
          </Button>
        </PageHeaderActions>
      </PageHeader>
      {casesQuery.isPending ? (
        <PageLoading label="Loading cases" />
      ) : casesQuery.isError ? (
        <p role="alert" className="rounded-md bg-surface px-4 py-6 text-sm text-destructive">
          Could not load cases: {getApiErrorMessage(casesQuery.error, 'Please try again.')}
        </p>
      ) : (
        <>
          <CasesTable
            cases={visibleCases}
            toolbar={
              <CaseFilters
                filters={filters}
                options={options}
                persistenceKey="cases-page"
                onChange={handleFilterChange}
              />
            }
            footer={
              <DataTableFooter>
                <DataTablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredCases.length}
                  perPage={pageSize}
                  onPageChange={setCurrentPage}
                  onPerPageChange={(nextPageSize) => {
                    setPageSize(nextPageSize)
                    setCurrentPage(1)
                  }}
                />
              </DataTableFooter>
            }
          />
        </>
      )}
    </Page>
  )
}

function getUniqueValues<Key extends keyof CaseListItem>(items: CaseListItem[], key: Key) {
  return [...new Set(items.map((item) => String(item[key])))]
}
