import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { getApiErrorMessage } from '../../../../shared/api/apiError'
import { downloadCaseFile } from '../../api/case-assets.api'
import { Card } from '../../../../shared/ui/Card'
import { PageLoading } from '../../../../shared/ui/Loading'
import { Page } from '../../../../shared/ui/Page'
import { Skeleton } from '../../../../shared/ui/Skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../shared/ui/Tabs'
import { toast } from '../../../../shared/ui/Toast'
import { useAuthorization } from '../../../auth/hooks/useAuthorization'
import { useAppliance } from '../../../appliances/queries/appliance.queries'
import {
  useAddCaseComment,
  useCase,
  useCaseActivity,
  useCaseFiles,
  useDeleteCaseFile,
  useRenameCaseFile,
  useUpdateCase,
  useUpdateCaseStageStatus,
  useUploadCaseFile,
} from '../../'
import type { CasePipelineCase, CasePipelineFile, CasePipelineStage, CaseProductionStep } from '../../domain/casePipeline'
import { caseKeys } from '../../queries/case.keys'
import { ApplianceCaseFields } from '../components/ApplianceCaseFields'
import { CasePipelineActivity } from '../components/CasePipelineActivity'
import { CasePipelineFiles } from '../components/CasePipelineFiles'
import { CasePipelineHeader } from '../components/CasePipelineHeader'
import { CasePipelineSidebarDetails } from '../components/CasePipelineSidebarDetails'
import { CaseWorkflowStages } from '../components/CaseWorkflowStages'

export function CasePipelinePage() {
  const { caseNumberCode = '' } = useParams<{ caseNumberCode: string }>()
  const { hasPermission } = useAuthorization()
  const canViewFiles = hasPermission('case_files:view')
  const canUploadFiles = hasPermission('case_files:upload')
  const canRenameFiles = hasPermission('case_files:update')
  const canDownloadFiles = hasPermission('case_files:download')
  const canDeleteFiles = hasPermission('case_files:delete')
  const canAssignTechnicians = hasPermission('production_steps:assign')
  const canViewActivity = hasPermission('case_activity:view')
  const canAddActivityNote = hasPermission('case_activity:add_note')
  const queryClient = useQueryClient()
  const caseQuery = useCase(caseNumberCode)
  const selectedCase = caseQuery.data
  const applianceQuery = useAppliance(selectedCase?.applianceId ?? '')
  const filesQuery = useCaseFiles(caseNumberCode, canViewFiles)
  const activityQuery = useCaseActivity(caseNumberCode, canViewActivity)
  const updateCaseMutation = useUpdateCase()
  const updateStageMutation = useUpdateCaseStageStatus()
  const uploadFileMutation = useUploadCaseFile()
  const renameFileMutation = useRenameCaseFile()
  const deleteFileMutation = useDeleteCaseFile()
  const addCommentMutation = useAddCaseComment()
  const selectedAppliance = applianceQuery.data
  const files = filesQuery.data ?? []
  const caseWithFiles = selectedCase
    ? {
        ...selectedCase,
        productionSteps: selectedCase.productionSteps.map((step) => ({
          ...step,
          files: files.filter((file) => file.stageId === step.id),
        })),
      }
    : undefined

  function updateLocalSteps(steps: CaseProductionStep[]) {
    if (!selectedCase) return
    queryClient.setQueryData<CasePipelineCase>(
      caseKeys.detail(selectedCase.id),
      (current) => current ? {
        ...current,
        productionSteps: steps,
        stage: steps.find((step) => step.status === 'active')?.name ??
          [...steps].reverse().find((step) => step.status === 'completed')?.name ??
          'Received',
      } : current,
    )

    const previousSteps = selectedCase.productionSteps
    const completedStep = steps.find((step) =>
      step.status === 'completed' &&
      previousSteps.find((previous) => previous.id === step.id)?.status !== 'completed',
    )
    const activatedStep = steps.find((step) =>
      step.status === 'active' &&
      previousSteps.find((previous) => previous.id === step.id)?.status !== 'active',
    )
    const changedStep = completedStep ?? activatedStep
    if (!changedStep) return

    void updateStageMutation.mutateAsync({
      caseNumber: selectedCase.id,
      stageId: changedStep.id,
      status: completedStep ? 'completed' : 'active',
    }).catch((error: unknown) => {
      toast.add({
        title: 'Could not update production stage',
        description: getApiErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
    })
  }

  async function moveSelectedCase(stage: CasePipelineStage) {
    if (!selectedCase) return
    const targetStep = selectedCase.productionSteps.find((step) => step.name === stage)
    if (!targetStep) return
    try {
      await updateStageMutation.mutateAsync({
        caseNumber: selectedCase.id,
        stageId: targetStep.id,
        status: 'active',
      })
      toast.add({
        title: 'Case pipeline updated',
        description: `Case moved to ${stage}.`,
        type: 'success',
      })
    } catch (error) {
      toast.add({
        title: 'Could not move case',
        description: getApiErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
    }
  }

  async function handleToggleRush() {
    if (!selectedCase) return
    const isRush = selectedCase.priority === 'Rush'
    try {
      await updateCaseMutation.mutateAsync({
        caseNumber: selectedCase.id,
        input: { priority: isRush ? 'Normal' : 'Rush' },
      })
      toast.add({
        title: isRush ? 'Rush priority removed' : 'Case marked as Rush',
        description: isRush
          ? 'Case priority set to Normal schedule.'
          : 'Case prioritized for rush turnaround schedule.',
        type: isRush ? 'info' : 'warning',
      })
    } catch (error) {
      toast.add({
        title: 'Could not update case priority',
        description: getApiErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
    }
  }

  async function handleUploadFile(file: File, stageId?: string): Promise<boolean> {
    if (!selectedCase) return false
    try {
      await uploadFileMutation.mutateAsync({
        caseNumber: selectedCase.id,
        file,
        ...(stageId ? { stageId } : {}),
      })
      toast.add({
        title: 'File uploaded',
        description: `"${file.name}" was added to this case.`,
        type: 'success',
      })
      return true
    } catch (error) {
      toast.add({
        title: 'Could not upload file',
        description: getApiErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
      return false
    }
  }

  async function handleRenameFile(fileId: string, name: string): Promise<boolean> {
    if (!selectedCase) return false
    try {
      await renameFileMutation.mutateAsync({
        caseNumber: selectedCase.id,
        fileId,
        name,
      })
      toast.add({ title: 'File renamed', description: name, type: 'success' })
      return true
    } catch (error) {
      toast.add({
        title: 'Could not rename file',
        description: getApiErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
      return false
    }
  }

  async function handleDeleteFile(file: CasePipelineFile): Promise<boolean> {
    if (!selectedCase) return false
    try {
      await deleteFileMutation.mutateAsync({
        caseNumber: selectedCase.id,
        fileId: file.id,
      })
      toast.add({
        title: 'File deleted',
        description: `"${file.name}" was removed from the case.`,
        type: 'success',
      })
      return true
    } catch (error) {
      toast.add({
        title: 'Could not delete file',
        description: getApiErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
      return false
    }
  }

  async function handleDownloadFile(file: CasePipelineFile) {
    if (!selectedCase) return
    try {
      const blob = await downloadCaseFile(selectedCase.id, file.id)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = file.name
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      toast.add({
        title: 'Could not download file',
        description: getApiErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
    }
  }

  async function handleAddNote(message: string): Promise<boolean> {
    if (!selectedCase) return false
    try {
      await addCommentMutation.mutateAsync({
        caseNumber: selectedCase.id,
        message,
      })
      toast.add({ title: 'Note added', type: 'success' })
      return true
    } catch (error) {
      toast.add({
        title: 'Could not add note',
        description: getApiErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
      return false
    }
  }

  if (caseQuery.isPending) return <Page size="full"><PageLoading label="Loading case" /></Page>
  if (caseQuery.isError) {
    return (
      <Page size="full">
        <p role="alert" className="rounded-md bg-surface px-4 py-10 text-center text-sm text-destructive">
          Could not load this case: {getApiErrorMessage(caseQuery.error, 'Please try again.')}
        </p>
      </Page>
    )
  }
  if (!selectedCase || !caseWithFiles) {
    return (
      <Page size="full">
        <p className="rounded-md bg-surface px-4 py-10 text-center text-sm text-text-muted">
          This case could not be found.
        </p>
      </Page>
    )
  }

  return (
    <Page size="full">
      <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_16rem]">
        <main className="grid min-w-0 gap-3.5">
          <CasePipelineHeader
            caseItem={selectedCase}
            onToggleRush={() => void handleToggleRush()}
            onSendBack={() => {
              const currentIndex = selectedCase.productionSteps.findIndex(
                (step) => step.name === selectedCase.stage,
              )
              const previousStep = selectedCase.productionSteps[currentIndex - 1]
              if (previousStep) void moveSelectedCase(previousStep.name)
            }}
          />

          <Tabs defaultValue="production" className="min-w-0">
            <TabsList variant="line" className="border-b border-border-subtle">
              <TabsTrigger value="production">Production</TabsTrigger>
              <TabsTrigger value="appliance">Appliance</TabsTrigger>
              {canViewFiles && <TabsTrigger value="files">Files</TabsTrigger>}
              {canViewActivity && <TabsTrigger value="activity">Activity</TabsTrigger>}
            </TabsList>
            <TabsContent value="production" className="pt-1">
              <CaseWorkflowStages
                key={selectedCase.id}
                caseItem={caseWithFiles}
                onUpdateSteps={updateLocalSteps}
                onUploadFile={(file, stageId) => handleUploadFile(file, stageId)}
                onRenameFile={handleRenameFile}
                onDownloadFile={handleDownloadFile}
                onDeleteFile={handleDeleteFile}
                canUploadFiles={canUploadFiles}
                canRenameFiles={canRenameFiles}
                canDownloadFiles={canDownloadFiles}
                canDeleteFiles={canDeleteFiles}
                canAssignTechnicians={canAssignTechnicians}
              />
            </TabsContent>
            <TabsContent value="appliance" className="pt-1">
              {selectedCase.applianceId && applianceQuery.isError ? (
                <p role="alert" className="text-sm text-destructive">
                  Could not load appliance fields: {getApiErrorMessage(applianceQuery.error, 'Please try again.')}
                </p>
              ) : applianceQuery.isPending && selectedCase.applianceId ? (
                <Card className="grid gap-3">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-24 w-full" />
                </Card>
              ) : selectedAppliance ? (
                <Card>
                  <ApplianceCaseFields
                    appliance={selectedAppliance}
                    values={selectedCase.caseFieldValues ?? {}}
                    onValueChange={(fieldKey, value) => {
                      const caseFieldValues = {
                        ...selectedCase.caseFieldValues,
                        [fieldKey]: value,
                      }
                      queryClient.setQueryData<CasePipelineCase>(
                        caseKeys.detail(selectedCase.id),
                        (current) => current ? { ...current, caseFieldValues } : current,
                      )
                      void updateCaseMutation.mutateAsync({
                        caseNumber: selectedCase.id,
                        input: { caseFieldValues },
                      }).catch((error: unknown) => {
                        toast.add({
                          title: 'Could not save case details',
                          description: getApiErrorMessage(error, 'Please try again.'),
                          type: 'error',
                        })
                      })
                    }}
                  />
                </Card>
              ) : (
                <Card className="py-10 text-center text-sm text-text-muted">
                  No appliance is linked to this case.
                </Card>
              )}
            </TabsContent>
            {canViewFiles && <TabsContent value="files" className="pt-1">
              <CasePipelineFiles
                caseNumber={selectedCase.id}
                files={files}
                isLoading={filesQuery.isPending}
                error={filesQuery.isError
                  ? getApiErrorMessage(filesQuery.error, 'Please try again.')
                  : undefined}
                isUploading={uploadFileMutation.isPending}
                isRenaming={renameFileMutation.isPending}
                isDeleting={deleteFileMutation.isPending}
                canUpload={canUploadFiles}
                canRename={canRenameFiles}
                canDownload={canDownloadFiles}
                canDelete={canDeleteFiles}
                onUpload={(file) => handleUploadFile(file)}
                onRename={handleRenameFile}
                onDelete={handleDeleteFile}
                onDownload={handleDownloadFile}
              />
            </TabsContent>}
            {canViewActivity && <TabsContent value="activity" className="pt-1">
              <CasePipelineActivity
                activities={activityQuery.data ?? []}
                isLoading={activityQuery.isPending}
                error={activityQuery.isError
                  ? getApiErrorMessage(activityQuery.error, 'Please try again.')
                  : undefined}
                isSubmitting={addCommentMutation.isPending}
                canAddNote={canAddActivityNote}
                onAddNote={handleAddNote}
              />
            </TabsContent>}
          </Tabs>
        </main>
        <CasePipelineSidebarDetails caseItem={selectedCase} />
      </div>
    </Page>
  )
}
