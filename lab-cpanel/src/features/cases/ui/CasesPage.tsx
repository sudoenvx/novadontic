import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeader, AppHeaderActions } from '../../../shared/ui/AppHeader'
import { Button } from '../../../shared/ui/Button'
import { Pagination } from '../../../shared/ui/Pagination'
import { Page } from '../../../shared/ui/Page'
import { caseFixtures } from '../data/cases'
import { emptyCaseListFilters, filterCaseList, type CaseListFilters, type CaseListItem } from '../domain/case'
import { CaseFilters } from './CaseFilters'
import { CasesTable } from './CasesTable'

const pageSize = 6

export function CasesPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<CaseListFilters>(emptyCaseListFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const filteredCases = useMemo(() => filterCaseList(caseFixtures, filters), [filters])
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize))
  const visibleCases = filteredCases.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const options = useMemo(() => ({
    appliances: getUniqueValues(caseFixtures, 'applianceType'),
    categories: getUniqueValues(caseFixtures, 'category'),
    clinics: getUniqueValues(caseFixtures, 'clinicName'),
    stages: getUniqueValues(caseFixtures, 'stage'),
  }), [])

  function handleFilterChange(nextFilters: CaseListFilters) {
    setFilters(nextFilters)
    setCurrentPage(1)
  }

  return (
    <Page size="full" className="gap-3.5">
      <AppHeader title="Cases" description="Search, filter, and open every case moving through the lab." >
        <AppHeaderActions><Button onClick={() => navigate('/cases/new')}><Plus /> Create case</Button></AppHeaderActions>
      </AppHeader>
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
        pagination={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCases.length}
            perPage={pageSize}
            onPageChange={setCurrentPage}
          />
        }
      />
    </Page>
  )
}

function getUniqueValues<Key extends keyof CaseListItem>(items: CaseListItem[], key: Key) {
  return [...new Set(items.map((item) => String(item[key])))]
}
