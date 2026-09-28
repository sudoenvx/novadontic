import { Collapsible } from '@base-ui/react/collapsible'
import {
  Boxes,
  Check,
  ChevronDown,
  Clock,
  Download,
  File,
  FileCode,
  FileText,
  Image as ImageIcon,
  Pencil,
  Save,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import { Badge, type BadgeTone } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../shared/ui/AlertDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../shared/ui/DropdownMenu'
import { Input } from '../../../shared/ui/Input'
import { toast } from '../../../shared/ui/Toast'
import { workflowTemplateFixtures } from '../../appliance-workflow-templates/data/workflowTemplates'
import { staffFixtures } from '../../staff/data/staff'
import { casePipelineStages } from '../domain/casePipeline'
import type {
  CasePipelineCase,
  CasePipelineFile,
  CaseProductionStep,
  ProductionStepStatus,
} from '../domain/casePipeline'

type CaseWorkflowStagesProps = {
  caseItem: CasePipelineCase
  onUpdateSteps: (steps: CaseProductionStep[]) => void
  onUpdateStage?: (stageName: CasePipelineCase['stage']) => void
}

const statusLabels: Record<ProductionStepStatus, string> = {
  completed: 'Completed',
  active: 'In progress',
  pending: 'Pending',
}

const statusTone: Record<ProductionStepStatus, BadgeTone> = {
  completed: 'success',
  active: 'info',
  pending: 'neutral',
}

function getFileIcon(type: CasePipelineFile['type']) {
  switch (type) {
    case 'STL':
      return <Boxes size={14} className="text-primary shrink-0" />
    case 'IMG':
      return <ImageIcon size={14} className="text-accent shrink-0" />
    case 'PDF':
      return <FileText size={14} className="text-destructive shrink-0" />
    case 'DOC':
      return <FileCode size={14} className="text-text-secondary shrink-0" />
    case 'OTHER':
      return <File size={14} className="text-text-muted shrink-0" />
  }
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

export function CaseWorkflowStages({
  caseItem,
  onUpdateSteps,
  onUpdateStage,
}: CaseWorkflowStagesProps) {
  // Derive workflow steps if empty or incomplete
  const initialSteps = useMemo(() => {
    if (caseItem.productionSteps && caseItem.productionSteps.length > 0) {
      return caseItem.productionSteps
    }

    const workflow =
      workflowTemplateFixtures.find(
        (w) =>
          w.id === caseItem.workflowTemplateId ||
          w.applianceId === caseItem.applianceId,
      ) ?? workflowTemplateFixtures[0]

    return (
      workflow?.steps.map((step, index) => ({
        id: `${caseItem.id}-${step.id}`,
        name: step.name,
        description: step.description,
        status:
          index === 0
            ? ('active' as const)
            : ('pending' as const),
        files: [],
        technicians: [],
      })) ?? []
    )
  }, [caseItem.productionSteps, caseItem.workflowTemplateId, caseItem.applianceId, caseItem.id])

  const [steps, setSteps] = useState<CaseProductionStep[]>(initialSteps)
  const [statusConfirmation, setStatusConfirmation] = useState<{
    stepId: string
    status: 'active' | 'completed'
  }>()

  // Determine the active stage ID
  const activeStepId = useMemo(() => {
    const activeStep = steps.find((step) => step.status === 'active')
    const matchingCurrent = steps.find(
      (step) => step.name.toLowerCase() === caseItem.stage.toLowerCase(),
    )
    const nextPending = steps.find((step) => step.status === 'pending')
    return activeStep?.id ?? matchingCurrent?.id ?? nextPending?.id ?? steps[0]?.id ?? ''
  }, [steps, caseItem.stage])

  // Collapsible state: all collapsed by default EXCEPT the current stage
  const [openStages, setOpenStages] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {}
    steps.forEach((step) => {
      state[step.id] = step.id === activeStepId
    })
    return state
  })

  const [uploadStepId, setUploadStepId] = useState('')
  const [editingFile, setEditingFile] = useState<{
    stepId: string
    fileId: string
    name: string
  }>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function updateStepsAndPropagate(updated: CaseProductionStep[]) {
    setSteps(updated)
    onUpdateSteps(updated)
  }

  function toggleStage(stepId: string) {
    setOpenStages((current) => ({
      ...current,
      [stepId]: !current[stepId],
    }))
  }

  function handleAssignTechnician(stepId: string, staffName: string) {
    const updated = steps.map((step) => {
      if (step.id !== stepId) return step

      const currentTechs = step.technicians ?? (step.technician ? [step.technician] : [])
      const exists = currentTechs.includes(staffName)
      const nextTechs = exists
        ? currentTechs.filter((t) => t !== staffName)
        : [...currentTechs, staffName]

      return {
        ...step,
        technicians: nextTechs,
        technician: nextTechs[0],
      }
    })

    updateStepsAndPropagate(updated)
    toast.add({
      title: 'Technician assignment updated',
      description: `Technicians updated for ${steps.find((s) => s.id === stepId)?.name}.`,
      type: 'success',
    })
  }

  function handleRemoveTechnician(stepId: string, techName: string) {
    const updated = steps.map((step) => {
      if (step.id !== stepId) return step
      const currentTechs = step.technicians ?? (step.technician ? [step.technician] : [])
      const nextTechs = currentTechs.filter((t) => t !== techName)
      return {
        ...step,
        technicians: nextTechs,
        technician: nextTechs[0],
      }
    })
    updateStepsAndPropagate(updated)
    toast.add({
      title: 'Technician unassigned',
      description: `${techName} removed from stage.`,
      type: 'success',
    })
  }

  function handleStepStatusChange(stepId: string, nextStatus: ProductionStepStatus) {
    const stepIndex = steps.findIndex((step) => step.id === stepId)
    if (stepIndex === -1) return

    const step = steps[stepIndex]
    const updated = steps.map((item) => {
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
    const nextStep = shouldAdvance ? updated[stepIndex + 1] : undefined
    if (nextStep && nextStep.status !== 'completed') {
      updated[stepIndex + 1] = { ...nextStep, status: 'active' }
      setOpenStages((current) => ({
        ...current,
        [stepId]: false,
        [nextStep.id]: true,
      }))
    } else if (nextStatus === 'active') {
      setOpenStages((current) => ({ ...current, [stepId]: true }))
    }

    updateStepsAndPropagate(updated)

    const selectedStep = nextStep ?? step
    toast.add({
      title: `Stage marked as ${statusLabels[nextStatus]}`,
      description: nextStep
        ? `${step.name} is complete. ${nextStep.name} is now in progress.`
        : `${step.name} is now ${statusLabels[nextStatus]}.`,
      type: 'success',
    })

    if (
      selectedStep &&
      (nextStatus === 'active' || nextStep) &&
      casePipelineStages.includes(selectedStep.name as CasePipelineCase['stage'])
    ) {
      onUpdateStage?.(selectedStep.name as CasePipelineCase['stage'])
    }
  }

  function requestStepStatusChange(
    stepId: string,
    nextStatus: 'active' | 'completed',
  ) {
    const step = steps.find((item) => item.id === stepId)
    if (!step) return

    const needsConfirmation =
      (nextStatus === 'completed' && step.status !== 'completed') ||
      (nextStatus === 'active' && step.status === 'completed')

    if (needsConfirmation) {
      setStatusConfirmation({ stepId, status: nextStatus })
      return
    }

    handleStepStatusChange(stepId, nextStatus)
  }

  function handleAddFile(stepId: string, selectedFile: globalThis.File) {
    const newFile: CasePipelineFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: selectedFile.name,
      type: getFileType(selectedFile.name),
      size: formatFileSize(selectedFile.size),
      uploadedBy: 'Current Lab User',
      uploadedAt: 'Today',
      url: URL.createObjectURL(selectedFile),
    }

    const updated = steps.map((step) => {
      if (step.id !== stepId) return step
      return {
        ...step,
        files: [...step.files, newFile],
      }
    })

    updateStepsAndPropagate(updated)
    toast.add({
      title: 'File added to stage',
      description: `"${newFile.name}" attached successfully.`,
      type: 'success',
    })

    setUploadStepId('')
  }

  function handleRenameFile(stepId: string, fileId: string) {
    if (!editingFile?.name.trim()) return

    const nextName = editingFile.name.trim()
    const updated = steps.map((step) =>
      step.id === stepId
        ? {
            ...step,
            files: step.files.map((file) =>
              file.id === fileId ? { ...file, name: nextName } : file,
            ),
          }
        : step,
    )
    updateStepsAndPropagate(updated)
    setEditingFile(undefined)
  }

  function handleDeleteFile(stepId: string, fileId: string, fileName: string) {
    const updated = steps.map((step) => {
      if (step.id !== stepId) return step
      return {
        ...step,
        files: step.files.filter((f) => f.id !== fileId),
      }
    })

    updateStepsAndPropagate(updated)
    toast.add({
      title: 'File deleted',
      description: `"${fileName}" was removed from the stage.`,
      type: 'success',
    })
  }

  function handleDownloadFile(file: CasePipelineFile) {
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

    toast.add({
      title: 'Downloading file',
      description: `Downloading ${file.name} (${file.size}).`,
      type: 'info',
    })
  }

  const completedCount = steps.filter((s) => s.status === 'completed').length
  const confirmationStep = steps.find(
    (step) => step.id === statusConfirmation?.stepId,
  )

  return (
    <section className="grid gap-3" aria-label="Case workflow stages">
      <input
        ref={fileInputRef}
        type="file"
        accept=".stl,.obj,.ply,.3mf,.pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tif,.tiff,.doc,.docx,.txt,.rtf,.xls,.xlsx,.csv"
        className="hidden"
        onChange={(event) => {
          const selectedFile = event.currentTarget.files?.[0]
          if (selectedFile && uploadStepId) {
            handleAddFile(uploadStepId, selectedFile)
          }
          event.currentTarget.value = ''
        }}
      />
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-text-primary">
            Workflow stages
          </h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            Track stage execution, technician assignments, and files.
          </p>
        </div>
        <Badge tone={completedCount === steps.length ? 'success' : 'info'}>
          {completedCount} of {steps.length} stages completed
        </Badge>
      </div>

      {/* Stage list */}
      <div className="grid gap-2">
        {steps.map((step, index) => {
          const isOpen = openStages[step.id] ?? false
          const isActive = step.status === 'active' || step.id === activeStepId
          const assignedTechs = step.technicians ?? (step.technician ? [step.technician] : [])

          return (
            <Collapsible.Root
              key={step.id}
              open={isOpen}
              onOpenChange={() => toggleStage(step.id)}
              className={[
                'stage overflow-hidden transition-all',
                isActive ? 'is-open' : '',
              ].join(' ')}
            >
              {/* ── Stage header ── */}
              <div
                className={[
                  'stage-head justify-between',
                  isActive ? 'bg-primary-soft/40' : 'hover:bg-surface-muted/60',
                ].join(' ')}
              >
                <Collapsible.Trigger className="group flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-primary rounded-xs">
                  {/* Step number / status node */}
                  <span
                    className={[
                      'step-node shrink-0 font-mono text-xs font-extrabold transition-colors',
                      step.status === 'completed' ? 'is-done' : step.status === 'active' ? 'is-now' : '',
                    ].join(' ')}
                  >
                    {step.status === 'completed' ? <Check size={12} /> : index + 1}
                  </span>

                  {/* Name + description */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary truncate">
                        {step.name}
                      </span>
                      <Badge tone={statusTone[step.status]} className="text-xs">
                        {statusLabels[step.status]}
                      </Badge>
                    </div>
                    {step.description && (
                      <p className="text-xs text-text-secondary truncate mt-0.5">
                        {step.description}
                      </p>
                    )}
                  </div>

                  {/* Mini summary chips */}
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0 text-xs text-text-muted">
                    {assignedTechs.length > 0 && (
                      <span className="pill">
                        <Users size={11} />
                        {assignedTechs.length}
                      </span>
                    )}
                    {step.files.length > 0 && (
                      <span className="pill">
                        <FileCode size={11} />
                        {step.files.length}
                      </span>
                    )}
                    <ChevronDown
                      size={15}
                      className={`text-text-muted transition-transform duration-(--duration-base) ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </Collapsible.Trigger>

                {/* Quick mark-done / re-open action — separated by left border */}
                <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-border-soft">
                  {step.status === 'active' ? (
                    <Button
                      size="xs"
                      variant="soft"
                      onClick={(e) => {
                        e.stopPropagation()
                        requestStepStatusChange(step.id, 'completed')
                      }}
                    >
                      <Check className="text-success" />
                      <span>Mark done</span>
                    </Button>
                  ) : step.status === 'completed' ? (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        requestStepStatusChange(step.id, 'active')
                      }}
                      className="text-text-muted"
                    >
                      <Clock />
                      <span>Re-open</span>
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleStepStatusChange(step.id, 'active')
                      }}
                    >
                      <Clock />
                      <span>Start stage</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* ── Stage body ── */}
              <Collapsible.Panel className="stage-body">
                <div className="grid gap-3">
                <div className="grid content-start gap-2 border-b border-border-soft pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-primary" />
                      <span className="text-xs font-semibold text-text-primary">
                        Assigned technicians ({assignedTechs.length})
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button size="xs" variant="outline" className="gap-1">
                            <UserPlus size={12} />
                            <span>Assign technicians</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-56">
                        {staffFixtures
                          .filter((s) => s.status === 'active')
                          .map((staff) => {
                            const isAssigned = assignedTechs.includes(staff.name)
                            return (
                              <DropdownMenuItem
                                key={staff.id}
                                onClick={() => handleAssignTechnician(step.id, staff.name)}
                                className="flex items-center justify-between py-1.5 text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="avatar size-6 text-2xs">
                                    {staff.name.slice(0, 2).toUpperCase()}
                                  </span>
                                  <span>{staff.name}</span>
                                </div>
                                {isAssigned && (
                                  <UserCheck size={13} className="text-success shrink-0" />
                                )}
                              </DropdownMenuItem>
                            )
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {assignedTechs.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {assignedTechs.map((techName) => (
                        <span
                          key={techName}
                          className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-0.5 text-xs font-medium text-text-primary"
                        >
                          <span className="size-1.5 rounded-full bg-success" />
                          {techName}
                          <button
                            type="button"
                            onClick={() => handleRemoveTechnician(step.id, techName)}
                            className="text-text-muted hover:text-destructive transition-colors ml-0.5"
                            aria-label={`Unassign ${techName}`}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted">
                      No technicians assigned yet.
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <FileCode size={13} className="text-primary" />
                      <span className="text-xs font-semibold text-text-primary">
                        Stage files ({step.files.length})
                      </span>
                    </div>

                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setUploadStepId(step.id)
                        fileInputRef.current?.click()
                      }}
                    >
                      <Upload size={12} />
                      <span>Add file</span>
                    </Button>
                  </div>

                  {step.files.length > 0 ? (
                    <div className="grid gap-1.5">
                      {step.files.map((file) => (
                        <div
                          key={file.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-1.5 transition-colors hover:bg-surface-soft"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {getFileIcon(file.type)}
                            <div className="min-w-0">
                              {editingFile?.stepId === step.id && editingFile.fileId === file.id ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    size="sm"
                                    aria-label={`Rename ${file.name}`}
                                    value={editingFile.name}
                                    onChange={(event) =>
                                      setEditingFile({ ...editingFile, name: event.target.value })
                                    }
                                    onKeyDown={(event) => {
                                      if (event.key === 'Enter') {
                                        event.preventDefault()
                                        handleRenameFile(step.id, file.id)
                                      }
                                      if (event.key === 'Escape') setEditingFile(undefined)
                                    }}
                                    autoFocus
                                  />
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    aria-label="Save file name"
                                    onClick={() => handleRenameFile(step.id, file.id)}
                                  >
                                    <Save />
                                  </Button>
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    aria-label="Cancel rename"
                                    onClick={() => setEditingFile(undefined)}
                                  >
                                    <X />
                                  </Button>
                                </div>
                              ) : (
                                <p className="truncate text-sm font-medium text-text-primary">
                                  {file.name}
                                </p>
                              )}
                              <p className="text-xs text-text-muted">
                                {file.type} · {file.size} · {file.uploadedBy} · {file.uploadedAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5">
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => setEditingFile({ stepId: step.id, fileId: file.id, name: file.name })}
                              title={`Rename ${file.name}`}
                              aria-label={`Rename ${file.name}`}
                            >
                              <Pencil />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => handleDownloadFile(file)}
                              title={`Download ${file.name}`}
                              aria-label={`Download ${file.name}`}
                            >
                              <Download />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => handleDeleteFile(step.id, file.id, file.name)}
                              className="text-destructive hover:text-destructive hover:bg-destructive-soft"
                              title={`Delete ${file.name}`}
                              aria-label={`Delete ${file.name}`}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state grid justify-items-center gap-1.5 py-4">
                      <p className="text-sm">No files uploaded for this stage yet.</p>
                      <Button
                        size="xs"
                        variant="link"
                        onClick={() => {
                          setUploadStepId(step.id)
                          fileInputRef.current?.click()
                        }}
                        className="h-auto px-1 py-0 text-primary"
                      >
                        <Upload size={12} />
                        <span>Upload CAD, scan or document</span>
                      </Button>
                    </div>
                  )}
                </div>
                </div>
              </Collapsible.Panel>
            </Collapsible.Root>
          )
        })}
      </div>
      <AlertDialog
        open={Boolean(statusConfirmation)}
        onOpenChange={(open) => {
          if (!open) setStatusConfirmation(undefined)
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusConfirmation?.status === 'completed'
                ? 'Mark stage as done?'
                : 'Reopen this stage?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusConfirmation?.status === 'completed'
                ? `Mark ${confirmationStep?.name} as complete and move the workflow forward?`
                : `Reopen ${confirmationStep?.name} and make it the active stage?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="solid"
              onClick={() => {
                if (!statusConfirmation) return
                handleStepStatusChange(
                  statusConfirmation.stepId,
                  statusConfirmation.status,
                )
                setStatusConfirmation(undefined)
              }}
            >
              {statusConfirmation?.status === 'completed' ? 'Mark done' : 'Reopen stage'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
