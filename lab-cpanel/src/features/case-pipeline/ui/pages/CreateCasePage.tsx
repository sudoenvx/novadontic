import { ArrowLeft, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { PageHeader, PageHeaderActions } from '../../../../shared/ui/PageHeader'
import { Button } from '../../../../shared/ui/Button'
import { Page } from '../../../../shared/ui/Page'
import { toast } from '../../../../shared/ui/Toast'
import { casePipelineFixtures } from '../../data/cases'
import { labSettings } from '../../../lab-settings/data/labSettings'
import { caseCategoryFixtures } from '../../data/caseCategories'
import { workflowTemplateFixtures } from '../../../appliance-workflow-templates/data/workflowTemplates'
import { appliances } from '../../../appliances/data/appliances'
import { clinicFixtures } from '../../../clinics/data/clinics'
import { doctorFixtures } from '../../../doctors/data/doctors'
import type { CasePipelineCase } from '../../domain/casePipeline'
import { CreateCaseForm, type CreateCaseValues } from '../components/CreateCaseForm'

export function CreateCasePage() {
  const navigate = useNavigate()

  function handleSubmit(values: CreateCaseValues) {
    const appliance = appliances.find((item) => item.id === values.applianceId)
    const workflow = workflowTemplateFixtures.find((item) => item.id === values.workflowTemplateId)
    const category = caseCategoryFixtures.find((item) => item.id === values.categoryId)
    const clinic = clinicFixtures.find((item) => item.id === values.clinicId)
    const doctor = doctorFixtures.find((item) => item.id === values.doctorId)
    const caseId = `OR-${4821 + casePipelineFixtures.length}`
    const productionSteps = workflow?.steps.map((step, index) => ({
      id: `${caseId}-${step.id}`,
      name: step.name,
      status: index === 0 ? 'active' as const : 'pending' as const,
      files: [],
    })) ?? []
    const newCase: CasePipelineCase = {
      id: caseId,
      patientName: values.patientName,
      patientCode: values.patientCode || 'Not provided',
      clinicName: clinic?.name ?? 'Portal request',
      doctorName: doctor?.name ?? 'Unassigned doctor',
      request: `${category?.name ?? 'New case'} · ${appliance?.name ?? 'Aligner'}`,
      caseType: appliance?.name ?? 'Appliance case',
      applianceId: values.applianceId,
      workflowTemplateId: values.workflowTemplateId,
      categoryId: category?.id,
      categoryName: category?.name,
      workflowName: workflow?.name,
      priceRule: values.priceRule,
      billable: values.billable,
      originalCaseId: values.originalCaseId,
      remakeReason: values.remakeReason,
      arch: 'Not provided',
      units: 0,
      status: 'On track',
      priority: values.priority,
      stage: 'Received',
      dueDate: values.turnaroundDays === undefined ? 'Not set' : `In ${values.turnaroundDays} days`,
      turnaroundDays: values.turnaroundDays,
      createdAt: 'Today',
      productionSteps,
      activities: [{ id: `${caseId}-created`, author: 'System', initials: '◷', message: 'Case created and ready for production.', createdAt: 'Today', isSystem: true }],
    }

    toast.add({ title: 'Case created', description: `${caseId} is ready for workflow management.`, type: 'success' })
    navigate(`/cases/${caseId}`, { state: { caseItem: newCase } })
  }

  return (
    <Page size="full">
      <PageHeader title="Create case" description="Set up the patient request and choose the production workflow for the lab team.">
        <PageHeaderActions>
          <Button variant="neutral" onClick={() => navigate(-1)}><ArrowLeft /> Cancel</Button>
          <Button type="submit" form="create-case-form"><Plus /> Create case</Button>
        </PageHeaderActions>
      </PageHeader>
      <CreateCaseForm cases={casePipelineFixtures} defaultTurnaroundDays={labSettings.defaultCaseTurnaroundDays} onCancel={() => navigate(-1)} onSubmit={handleSubmit} />
    </Page>
  )
}
