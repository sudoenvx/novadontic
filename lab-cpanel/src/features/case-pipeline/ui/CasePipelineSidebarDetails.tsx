import { Card, CardHeader, CardTitle } from '../../../shared/ui/Card'
import { getCaseBillingRuleLabel } from '../domain/caseCategory'
import type { ReactNode } from 'react'
import type { CasePipelineCase } from '../domain/casePipeline'

export function CasePipelineSidebarDetails({ caseItem }: { caseItem: CasePipelineCase }) {
  return (
    <aside className="grid gap-2 lg:sticky lg:top-3 lg:self-start">
      <InfoCard title="Doctor & clinic">
        <Detail label="Doctor" value={caseItem.doctorName} />
        <Detail label="Clinic" value={caseItem.clinicName} />
        <Detail label="Request" value={caseItem.request} />
      </InfoCard>
      <InfoCard title="Case meta">
        <Detail label="Patient code" value={caseItem.patientCode} />
        <Detail label="Type" value={caseItem.caseType} />
        {caseItem.categoryName && <Detail label="Category" value={caseItem.categoryName} />}
        {caseItem.workflowName && <Detail label="Workflow" value={caseItem.workflowName} />}
        {caseItem.priceRule && <Detail label="Price" value={getCaseBillingRuleLabel(caseItem.priceRule)} />}
        {caseItem.billable !== undefined && <Detail label="Billing" value={caseItem.billable ? 'Billable' : 'Not billable'} />}
        <Detail label="Units" value={caseItem.units ? `${caseItem.units} items` : 'Pending'} />
        <Detail label="Due" value={caseItem.dueDate} emphasis={caseItem.status !== 'On track'} />
        <Detail label="Priority" value={caseItem.priority} emphasis={caseItem.priority === 'Rush'} />
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

function Detail({ emphasis = false, label, value }: { emphasis?: boolean; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2 text-sm">
      <span className="text-text-muted">{label}</span>
      <span className={emphasis ? 'font-semibold text-accent' : 'font-medium text-text'}>{value}</span>
    </div>
  )
}
