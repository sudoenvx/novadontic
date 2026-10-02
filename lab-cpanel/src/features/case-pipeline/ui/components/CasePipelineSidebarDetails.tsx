import { Card, CardHeader, CardTitle } from '../../../../shared/ui/Card'
import { Badge } from '../../../../shared/ui/Badge'
import {
  DescriptionItem,
  DescriptionItemDescription,
  DescriptionItemTitle,
  DescriptionList,
} from '../../../../shared/ui/DescriptionList'
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
          <DescriptionItem><DescriptionItemTitle>Type</DescriptionItemTitle><DescriptionItemDescription><Badge size="xs" tone="neutral">{caseItem.caseType}</Badge></DescriptionItemDescription></DescriptionItem>
          {caseItem.categoryName && <DescriptionItem><DescriptionItemTitle>Category</DescriptionItemTitle><DescriptionItemDescription><Badge size="xs" tone="accent">{caseItem.categoryName}</Badge></DescriptionItemDescription></DescriptionItem>}
          {caseItem.workflowName && <DescriptionItem><DescriptionItemTitle>Workflow</DescriptionItemTitle><DescriptionItemDescription>{caseItem.workflowName}</DescriptionItemDescription></DescriptionItem>}
          <DescriptionItem>
            <DescriptionItemTitle>Due</DescriptionItemTitle>
            <DescriptionItemDescription className={caseItem.status !== 'On track' ? 'font-semibold text-warning' : undefined}>
              {caseItem.dueDate}
            </DescriptionItemDescription>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionItemTitle>Priority</DescriptionItemTitle>
            <DescriptionItemDescription>
              <Badge
                size="xs"
                tone={caseItem.priority === 'Rush' ? 'destructive' : 'neutral'}
              >
                {caseItem.priority}
              </Badge>
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
