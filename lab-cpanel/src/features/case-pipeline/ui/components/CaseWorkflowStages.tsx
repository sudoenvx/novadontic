import { useMemo, useState } from 'react'

import { toast } from '../../../../shared/ui/Toast'
import { workflowTemplateFixtures } from '../../../appliance-workflow-templates/data/workflowTemplates'
import { casePipelineStages } from '../../domain/casePipeline'
import type {
  CasePipelineCase,
  CasePipelineFile,
  CaseProductionStep,
  ProductionStepStatus,
} from '../../domain/casePipeline'
import { CaseWorkflowStageHeader } from './CaseWorkflowStageHeader'
import type { EditingStageFile } from './StageFiles'
import { StageStatusConfirmationDialog } from './StageStatusConfirmationDialog'
import { WorkflowStageCard } from './WorkflowStageCard'

type CaseWorkflowStagesProps = {
  caseItem: CasePipelineCase
  onUpdateSteps: (steps: CaseProductionStep[]) => void
  onUpdateStage?: (stageName: CasePipelineCase['stage']) => void
}

export function CaseWorkflowStages({
  caseItem,
  onUpdateSteps,
  onUpdateStage,
}: CaseWorkflowStagesProps) {
  const initialSteps = useMemo(() => {
    if (caseItem.productionSteps?.length) return caseItem.productionSteps

    const workflow = workflowTemplateFixtures.find(
      (item) =>
        item.id === caseItem.workflowTemplateId ||
        item.applianceId === caseItem.applianceId,
    ) ?? workflowTemplateFixtures[0]

    return workflow?.steps.map((step, index) => ({
      id: `${caseItem.id}-${step.id}`,
      name: step.name,
      description: step.description,
      status: index === 0 ? 'active' as const : 'pending' as const,
      files: [],
      technicians: [],
    })) ?? []
  }, [caseItem.applianceId, caseItem.id, caseItem.productionSteps, caseItem.workflowTemplateId])

  const [steps, setSteps] = useState<CaseProductionStep[]>(initialSteps)
  const [editingFile, setEditingFile] = useState<EditingStageFile>()
  const [statusConfirmation, setStatusConfirmation] = useState<{
    stepId: string
    status: 'active' | 'completed'
  }>()

  const activeStepId = useMemo(() => {
    const activeStep = steps.find((step) => step.status === 'active')
    const currentStep = steps.find(
      (step) => step.name.toLowerCase() === caseItem.stage.toLowerCase(),
    )
    const nextPendingStep = steps.find((step) => step.status === 'pending')
    return activeStep?.id ?? currentStep?.id ?? nextPendingStep?.id ?? steps[0]?.id ?? ''
  }, [caseItem.stage, steps])

  const [openStages, setOpenStages] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialSteps.map((step) => [step.id, step.id === activeStepId])),
  )

  function updateSteps(updatedSteps: CaseProductionStep[]) {
    setSteps(updatedSteps)
    onUpdateSteps(updatedSteps)
  }

  function assignTechnician(stepId: string, staffName: string) {
    const updatedSteps = steps.map((step) => {
      if (step.id !== stepId) return step

      const currentTechnicians = step.technicians ?? (step.technician ? [step.technician] : [])
      const nextTechnicians = currentTechnicians.includes(staffName)
        ? currentTechnicians.filter((name) => name !== staffName)
        : [...currentTechnicians, staffName]

      return {
        ...step,
        technicians: nextTechnicians,
        technician: nextTechnicians[0],
      }
    })

    updateSteps(updatedSteps)
    toast.add({
      title: 'Technician assignment updated',
      description: `Technicians updated for ${steps.find((step) => step.id === stepId)?.name}.`,
      type: 'success',
    })
  }

  function removeTechnician(stepId: string, staffName: string) {
    const updatedSteps = steps.map((step) => {
      if (step.id !== stepId) return step
      const currentTechnicians = step.technicians ?? (step.technician ? [step.technician] : [])
      const nextTechnicians = currentTechnicians.filter((name) => name !== staffName)
      return {
        ...step,
        technicians: nextTechnicians,
        technician: nextTechnicians[0],
      }
    })

    updateSteps(updatedSteps)
    toast.add({
      title: 'Technician unassigned',
      description: `${staffName} removed from stage.`,
      type: 'success',
    })
  }

  function changeStepStatus(stepId: string, nextStatus: ProductionStepStatus) {
    const stepIndex = steps.findIndex((step) => step.id === stepId)
    if (stepIndex < 0) return

    const step = steps[stepIndex]
    const updatedSteps = steps.map((item) => {
      if (item.id === stepId) return { ...item, status: nextStatus }
      if (nextStatus === 'active' && item.status === 'active') {
        return { ...item, status: 'pending' as const }
      }
      return item
    })
    const shouldAdvance =
      nextStatus === 'completed' &&
      step.status !== 'completed' &&
      (step.status === 'active' || step.id === activeStepId)
    const nextStep = shouldAdvance ? updatedSteps[stepIndex + 1] : undefined

    if (nextStep && nextStep.status !== 'completed') {
      updatedSteps[stepIndex + 1] = { ...nextStep, status: 'active' }
      setOpenStages((current) => ({
        ...current,
        [stepId]: false,
        [nextStep.id]: true,
      }))
    } else if (nextStatus === 'active') {
      setOpenStages((current) => ({ ...current, [stepId]: true }))
    }

    updateSteps(updatedSteps)
    toast.add({
      title: `Stage marked as ${nextStatus === 'completed' ? 'Completed' : nextStatus === 'active' ? 'In progress' : 'Pending'}`,
      description: nextStep
        ? `${step.name} is complete. ${nextStep.name} is now in progress.`
        : `${step.name} is now ${nextStatus === 'active' ? 'In progress' : nextStatus === 'completed' ? 'Completed' : 'Pending'}.`,
      type: 'success',
    })

    const activeStep = nextStep ?? step
    if (
      (nextStatus === 'active' || nextStep) &&
      casePipelineStages.includes(activeStep.name as CasePipelineCase['stage'])
    ) {
      onUpdateStage?.(activeStep.name as CasePipelineCase['stage'])
    }
  }

  function requestStepStatusChange(stepId: string, nextStatus: 'active' | 'completed') {
    const step = steps.find((item) => item.id === stepId)
    if (!step) return

    const needsConfirmation =
      (nextStatus === 'completed' && step.status !== 'completed') ||
      (nextStatus === 'active' && step.status === 'completed')

    if (needsConfirmation) {
      setStatusConfirmation({ stepId, status: nextStatus })
      return
    }
    changeStepStatus(stepId, nextStatus)
  }

  function addFile(file: File, stepId: string) {
    const stageFile: CasePipelineFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      type: getFileType(file.name),
      size: formatFileSize(file.size),
      uploadedBy: 'Current Lab User',
      uploadedAt: 'Today',
      url: URL.createObjectURL(file),
    }
    const updatedSteps = steps.map((step) =>
      step.id === stepId ? { ...step, files: [...step.files, stageFile] } : step,
    )

    updateSteps(updatedSteps)
    toast.add({
      title: 'File added to stage',
      description: `"${stageFile.name}" attached successfully.`,
      type: 'success',
    })
  }

  function renameFile(stepId: string, fileId: string) {
    if (!editingFile?.name.trim()) return

    const nextName = editingFile.name.trim()
    const updatedSteps = steps.map((step) =>
      step.id === stepId
        ? {
            ...step,
            files: step.files.map((file) => file.id === fileId ? { ...file, name: nextName } : file),
          }
        : step,
    )
    updateSteps(updatedSteps)
    setEditingFile(undefined)
  }

  function deleteFile(stepId: string, fileId: string, fileName: string) {
    const updatedSteps = steps.map((step) =>
      step.id === stepId
        ? { ...step, files: step.files.filter((file) => file.id !== fileId) }
        : step,
    )
    updateSteps(updatedSteps)
    toast.add({ title: 'File deleted', description: `"${fileName}" was removed from the stage.`, type: 'success' })
  }

  function downloadFile(file: CasePipelineFile) {
    const url = file.url ?? URL.createObjectURL(
      new Blob([`Dummy contents for ${file.name}`], { type: 'text/plain' }),
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = file.name
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    if (!file.url) URL.revokeObjectURL(url)
    toast.add({ title: 'Downloading file', description: `Downloading ${file.name} (${file.size}).`, type: 'info' })
  }

  const confirmationStep = steps.find((step) => step.id === statusConfirmation?.stepId)

  return (
    <section className="grid gap-3" aria-label="Case workflow stages">
      <CaseWorkflowStageHeader steps={steps} />
      <div className="grid gap-2">
        {steps.map((step, index) => (
          <WorkflowStageCard
            key={step.id}
            step={step}
            index={index}
            isOpen={openStages[step.id] ?? false}
            isActive={step.status === 'active' || step.id === activeStepId}
            editingFile={editingFile}
            onOpenChange={(open) => setOpenStages((current) => ({ ...current, [step.id]: open }))}
            onStatusChange={(status) => requestStepStatusChange(step.id, status)}
            onAssignTechnician={(name) => assignTechnician(step.id, name)}
            onRemoveTechnician={(name) => removeTechnician(step.id, name)}
            onSelectFile={addFile}
            onStartRename={(file) => setEditingFile({ stepId: step.id, fileId: file.id, name: file.name })}
            onRename={(fileId) => renameFile(step.id, fileId)}
            onCancelRename={() => setEditingFile(undefined)}
            onRenameChange={(name) => setEditingFile((current) => current ? { ...current, name } : current)}
            onDownloadFile={downloadFile}
            onDeleteFile={(file) => deleteFile(step.id, file.id, file.name)}
          />
        ))}
      </div>
      <StageStatusConfirmationDialog
        open={Boolean(statusConfirmation)}
        stepName={confirmationStep?.name}
        status={statusConfirmation?.status}
        onOpenChange={(open) => { if (!open) setStatusConfirmation(undefined) }}
        onConfirm={() => {
          if (!statusConfirmation) return
          changeStepStatus(statusConfirmation.stepId, statusConfirmation.status)
          setStatusConfirmation(undefined)
        }}
      />
    </section>
  )
}

function getFileType(fileName: string): CasePipelineFile['type'] {
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (['stl', 'ply', 'obj', '3mf'].includes(extension ?? '')) return 'STL'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tif', 'tiff'].includes(extension ?? '')) return 'IMG'
  if (extension === 'pdf') return 'PDF'
  if (['doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'csv'].includes(extension ?? '')) return 'DOC'
  return 'OTHER'
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
