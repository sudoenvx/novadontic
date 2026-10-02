import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageHeader, PageHeaderActions } from '../../../shared/ui/PageHeader'
import { Button } from '../../../shared/ui/Button'
import { DataTableFooter, DataTablePagination } from '../../../shared/ui/data-table'
import { Page } from '../../../shared/ui/Page'
import { caseFixtures } from '../data/cases'
import { emptyCaseListFilters, filterCaseList, type CaseListFilters, type CaseListItem } from '../domain/case'
import { CaseFilters } from './CaseFilters'
import { CasesTable } from './CasesTable'

export function CasesPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<CaseListFilters>(emptyCaseListFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const filteredCases = useMemo(() => filterCaseList(caseFixtures, filters), [filters])
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize))
  const visibleCases = filteredCases.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const options = useMemo(() => ({
    appliances: getUniqueValues(caseFixtures, 'applianceType'),
    categories: getUniqueValues(caseFixtures, 'category'),
    stages: getUniqueValues(caseFixtures, 'stage'),
  }), [])

  function handleFilterChange(nextFilters: CaseListFilters) {
    setFilters(nextFilters)
    setCurrentPage(1)
  }

  return (
    <Page size="full" className="gap-3.5">
      <PageHeader title="Cases" description="Search, filter, and open every case moving through the lab." >
        <PageHeaderActions><Button onClick={() => navigate('/cases/new')}><Plus /> Create case</Button></PageHeaderActions>
      </PageHeader>
      <CaseFilters
        filters={filters}
        options={options}
        totalCount={filteredCases.length}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(emptyCaseListFilters)}
      />
      <CasesTable
        cases={visibleCases}
        totalCount={filteredCases.length}
        onResetFilters={() => handleFilterChange(emptyCaseListFilters)}
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
    </Page>
  )
}

function getUniqueValues<Key extends keyof CaseListItem>(items: CaseListItem[], key: Key) {
  return [...new Set(items.map((item) => String(item[key])))]
}
