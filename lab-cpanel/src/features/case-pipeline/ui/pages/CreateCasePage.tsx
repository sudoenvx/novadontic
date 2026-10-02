import { ArrowLeft, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { PageHeader, PageHeaderActions } from '../../../../shared/ui/PageHeader'
import { Button } from '../../../../shared/ui/Button'
import { PageLoading } from '../../../../shared/ui/Loading'
import { Page } from '../../../../shared/ui/Page'
import { toast } from '../../../../shared/ui/Toast'
import { caseCategoryFixtures } from '../../data/caseCategories'
import { useWorkflowTemplateOptions } from '../../../appliance-workflow-templates'
import { useAppliances } from '../../../appliances/queries/appliance.queries'
import { getApiErrorMessage } from '../../../../shared/api/apiError'
import { useCases, useCreateCase } from '../../'
import { CreateCaseForm, type CreateCaseValues } from '../components/CreateCaseForm'

export function CreateCasePage() {
  const navigate = useNavigate()
  const casesQuery = useCases()
  const appliancesQuery = useAppliances()
  const workflowsQuery = useWorkflowTemplateOptions()
  const createCaseMutation = useCreateCase()
  const isLoading = casesQuery.isPending || appliancesQuery.isPending || workflowsQuery.isPending
  const error = casesQuery.error ?? appliancesQuery.error ?? workflowsQuery.error

  async function handleSubmit(values: CreateCaseValues) {
    const category = caseCategoryFixtures.find((item) => item.id === values.categoryId)
    const newCase = await createCaseMutation.mutateAsync({
      patientName: values.patientName,
      patientCode: values.patientCode || undefined,
      clinicId: values.clinicId || null,
      doctorId: values.doctorId,
      applianceTypeId: values.applianceId,
      workflowTemplateId: values.workflowTemplateId,
      categoryId: values.categoryId,
      categoryName: values.categoryName ?? category?.name ?? 'New case',
      dueDate: values.dueDate || null,
      priority: values.priority,
      priceRule: values.priceRule,
      billable: values.billable,
      originalCaseNumber: values.originalCaseId || null,
      remakeReason: values.remakeReason || null,
    })

    toast.add({ title: 'Case created', description: `${newCase.id} is ready for workflow management.`, type: 'success' })
    navigate(`/cases/${newCase.id}`)
  }

  return (
    <Page size="full">
      <PageHeader title="Create case" description="Set up the patient request and choose the production workflow for the lab team.">
        <PageHeaderActions>
          <Button variant="neutral" onClick={() => navigate(-1)}><ArrowLeft /> Cancel</Button>
          <Button type="submit" form="create-case-form" disabled={createCaseMutation.isPending}>
            <Plus /> {createCaseMutation.isPending ? 'Creating…' : 'Create case'}
          </Button>
        </PageHeaderActions>
      </PageHeader>
      {isLoading ? (
        <PageLoading label="Loading case creation options" />
      ) : error ? (
        <p role="alert" className="rounded-md bg-surface px-4 py-6 text-sm text-destructive">
          Could not load case creation data: {getApiErrorMessage(error, 'Please try again.')}
        </p>
      ) : (
        <CreateCaseForm
          cases={casesQuery.data ?? []}
          appliances={(appliancesQuery.data ?? []).filter((appliance) => appliance.isActive)}
          workflows={workflowsQuery.data ?? []}
          defaultTurnaroundDays={7}
          isSubmitting={createCaseMutation.isPending}
          onCancel={() => navigate(-1)}
          onSubmit={handleSubmit}
        />
      )}
    </Page>
  )
}
