import { Card, CardHeader, CardTitle } from '../../../shared/ui/Card'
import { DescriptionList, type DescriptionListItem } from '../../../shared/ui/DescriptionList'
import { getCaseBillingRuleLabel } from '../domain/caseCategory'
import type { ReactNode } from 'react'
import type { CasePipelineCase } from '../domain/casePipeline'

export function CasePipelineSidebarDetails({ caseItem }: { caseItem: CasePipelineCase }) {
  const doctorClinicItems: DescriptionListItem[] = [
    { id: 'doctor', title: 'Doctor', description: caseItem.doctorName },
    { id: 'clinic', title: 'Clinic', description: caseItem.clinicName },
    { id: 'request', title: 'Request', description: caseItem.request },
  ]
  const caseMetaItems: DescriptionListItem[] = [
    { id: 'patient-code', title: 'Patient code', description: caseItem.patientCode },
    { id: 'type', title: 'Type', description: caseItem.caseType },
    ...(caseItem.categoryName
      ? [{ id: 'category', title: 'Category', description: caseItem.categoryName }]
      : []),
    ...(caseItem.workflowName
      ? [{ id: 'workflow', title: 'Workflow', description: caseItem.workflowName }]
      : []),
    ...(caseItem.priceRule
      ? [{ id: 'price', title: 'Price', description: getCaseBillingRuleLabel(caseItem.priceRule) }]
      : []),
    ...(caseItem.billable !== undefined
      ? [{ id: 'billing', title: 'Billing', description: caseItem.billable ? 'Billable' : 'Not billable' }]
      : []),
    { id: 'units', title: 'Units', description: caseItem.units ? `${caseItem.units} items` : 'Pending' },
    {
      id: 'due',
      title: 'Due',
      description: <span className={caseItem.status !== 'On track' ? 'font-semibold text-warning' : undefined}>{caseItem.dueDate}</span>,
    },
    {
      id: 'priority',
      title: 'Priority',
      description: <span className={caseItem.priority === 'Rush' ? 'font-semibold text-destructive' : undefined}>{caseItem.priority}</span>,
    },
  ]

  return (
    <aside className="grid gap-2 lg:sticky lg:top-3 lg:self-start">
      <InfoCard title="Doctor & clinic">
        <DescriptionList items={doctorClinicItems} />
      </InfoCard>
      <InfoCard title="Case meta">
        <DescriptionList items={caseMetaItems} />
      </InfoCard>
    </aside>
  )
}

function InfoCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Card size="sm" className="gap-3 bg-surface">
      <CardHeader><CardTitle className="normal-case text-sm">{title}</CardTitle></CardHeader>
      {children}
    </Card>
  )
}

