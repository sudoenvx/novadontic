import { useMemo, useState } from 'react'

import { toast } from '../../../../shared/ui/Toast'
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
  onUploadFile: (file: File, stepId: string) => Promise<boolean>
  onRenameFile: (fileId: string, name: string) => Promise<boolean>
  onDownloadFile: (file: CasePipelineFile) => Promise<void>
  onDeleteFile: (file: CasePipelineFile) => Promise<boolean>
  canUploadFiles: boolean
  canRenameFiles: boolean
  canDownloadFiles: boolean
  canDeleteFiles: boolean
  canAssignTechnicians: boolean
}

export function CaseWorkflowStages({
  caseItem,
  onUpdateSteps,
  onUploadFile,
  onRenameFile,
  onDownloadFile,
  onDeleteFile,
  canUploadFiles,
  canRenameFiles,
  canDownloadFiles,
  canDeleteFiles,
  canAssignTechnicians,
}: CaseWorkflowStagesProps) {
  const steps = caseItem.productionSteps
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
    Object.fromEntries(steps.map((step) => [step.id, step.id === activeStepId])),
  )

  function updateSteps(updatedSteps: CaseProductionStep[]) {
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
    void onUploadFile(file, stepId)
  }

  function renameFile(stepId: string, fileId: string) {
    if (!editingFile?.name.trim()) return

    const nextName = editingFile.name.trim()
    const file = steps.find((step) => step.id === stepId)?.files.find(({ id }) => id === fileId)
    if (!file) return
    void onRenameFile(fileId, nextName).then((success) => {
      if (success) setEditingFile(undefined)
    })
  }

  function deleteFile(file: CasePipelineFile) {
    void onDeleteFile(file)
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
            onDownloadFile={onDownloadFile}
            onDeleteFile={deleteFile}
            canUploadFiles={canUploadFiles}
            canRenameFiles={canRenameFiles}
            canDownloadFiles={canDownloadFiles}
            canDeleteFiles={canDeleteFiles}
            canAssignTechnicians={canAssignTechnicians}
            caseNumberCode={caseItem.id}
            doctorName={caseItem.doctorName}
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
