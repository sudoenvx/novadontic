export type CaseType = string
export type CaseStage = string
export type CaseStatus = 'On track' | 'Due today' | 'Needs attention'

export type DashboardCase = {
  id: string
  patientName: string
  clinic: string
  caseType: CaseType
  category: string
  stage: CaseStage
  dueDate: string
  status: CaseStatus
  assignee: string
}

export function countCasesByType(cases: DashboardCase[]) {
  return cases.reduce<Record<string, number>>((counts, dashboardCase) => {
    counts[dashboardCase.caseType] = (counts[dashboardCase.caseType] ?? 0) + 1
    return counts
  }, {})
}

export function filterCasesByType(cases: DashboardCase[], caseType: string) {
  return caseType === 'all'
    ? cases
    : cases.filter((dashboardCase) => dashboardCase.caseType === caseType)
}
