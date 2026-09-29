import { Card, CardHeader, CardTitle } from '../../../../shared/ui/Card'
import {
  DescriptionItem,
  DescriptionItemDescription,
  DescriptionItemTitle,
  DescriptionList,
} from '../../../../shared/ui/DescriptionList'
import { getCaseBillingRuleLabel } from '../../domain/caseCategory'
import type { ReactNode } from 'react'
import type { CasePipelineCase } from '../../domain/casePipeline'

export function CasePipelineSidebarDetails({ caseItem }: { caseItem: CasePipelineCase }) {
  return (
    <aside className="grid gap-2 xl:sticky xl:top-[calc(var(--navbar-height)+var(--page-gap))] xl:self-start">
      <InfoCard title="Doctor & clinic">
        <DescriptionList>
          <DescriptionItem><DescriptionItemTitle>Doctor</DescriptionItemTitle><DescriptionItemDescription>{caseItem.doctorName}</DescriptionItemDescription></DescriptionItem>
          <DescriptionItem><DescriptionItemTitle>Clinic</DescriptionItemTitle><DescriptionItemDescription>{caseItem.clinicName}</DescriptionItemDescription></DescriptionItem>
          <DescriptionItem><DescriptionItemTitle>Request</DescriptionItemTitle><DescriptionItemDescription>{caseItem.request}</DescriptionItemDescription></DescriptionItem>
        </DescriptionList>
      </InfoCard>
      <InfoCard title="Case meta">
        <DescriptionList>
          <DescriptionItem><DescriptionItemTitle>Patient code</DescriptionItemTitle><DescriptionItemDescription>{caseItem.patientCode}</DescriptionItemDescription></DescriptionItem>
          <DescriptionItem><DescriptionItemTitle>Type</DescriptionItemTitle><DescriptionItemDescription>{caseItem.caseType}</DescriptionItemDescription></DescriptionItem>
          {caseItem.categoryName && <DescriptionItem><DescriptionItemTitle>Category</DescriptionItemTitle><DescriptionItemDescription>{caseItem.categoryName}</DescriptionItemDescription></DescriptionItem>}
          {caseItem.workflowName && <DescriptionItem><DescriptionItemTitle>Workflow</DescriptionItemTitle><DescriptionItemDescription>{caseItem.workflowName}</DescriptionItemDescription></DescriptionItem>}
          {caseItem.priceRule && <DescriptionItem><DescriptionItemTitle>Price</DescriptionItemTitle><DescriptionItemDescription>{getCaseBillingRuleLabel(caseItem.priceRule)}</DescriptionItemDescription></DescriptionItem>}
          {caseItem.billable !== undefined && <DescriptionItem><DescriptionItemTitle>Billing</DescriptionItemTitle><DescriptionItemDescription>{caseItem.billable ? 'Billable' : 'Not billable'}</DescriptionItemDescription></DescriptionItem>}
          <DescriptionItem><DescriptionItemTitle>Units</DescriptionItemTitle><DescriptionItemDescription>{caseItem.units ? `${caseItem.units} items` : 'Pending'}</DescriptionItemDescription></DescriptionItem>
          <DescriptionItem>
            <DescriptionItemTitle>Due</DescriptionItemTitle>
            <DescriptionItemDescription className={caseItem.status !== 'On track' ? 'font-semibold text-warning' : undefined}>
              {caseItem.dueDate}
            </DescriptionItemDescription>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionItemTitle>Priority</DescriptionItemTitle>
            <DescriptionItemDescription className={caseItem.priority === 'Rush' ? 'font-semibold text-destructive' : undefined}>
              {caseItem.priority}
            </DescriptionItemDescription>
          </DescriptionItem>
        </DescriptionList>
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

