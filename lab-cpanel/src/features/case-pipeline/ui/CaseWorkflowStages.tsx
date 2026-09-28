import { Collapsible } from '@base-ui/react/collapsible'
import {
  Boxes,
  Check,
  ChevronDown,
  Clock,
  Download,
  FileCode,
  FileText,
  Image as ImageIcon,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Badge, type BadgeTone } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/Dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../shared/ui/DropdownMenu'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/Select'
import { toast } from '../../../shared/ui/Toast'
import { workflowTemplateFixtures } from '../../appliance-workflow-templates/data/workflowTemplates'
import { staffFixtures } from '../../staff/data/staff'
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
    default:
      return <FileCode size={14} className="text-text-secondary shrink-0" />
  }
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

  // Keep steps synced when caseItem changes
  useEffect(() => {
    if (caseItem.productionSteps && caseItem.productionSteps.length > 0) {
      setSteps(caseItem.productionSteps)
    }
  }, [caseItem.productionSteps])

  // Determine the active stage ID
  const activeStepId = useMemo(() => {
    const matchingCurrent = steps.find(
      (s) =>
        s.name.toLowerCase() === caseItem.stage.toLowerCase() ||
        s.status === 'active',
    )
    return matchingCurrent?.id ?? steps[0]?.id ?? ''
  }, [steps, caseItem.stage])

  // Collapsible state: all collapsed by default EXCEPT the current stage
  const [openStages, setOpenStages] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {}
    steps.forEach((step) => {
      state[step.id] = step.id === activeStepId
    })
    return state
  })

  // File upload dialog state
  const [uploadDialogState, setUploadDialogState] = useState<{
    stepId: string
    isOpen: boolean
  }>({ stepId: '', isOpen: false })

  const [newFileName, setNewFileName] = useState('')
  const [newFileType, setNewFileType] = useState<CasePipelineFile['type']>('STL')
  const [newFileSize, setNewFileSize] = useState('2.4 MB')
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
    const updated = steps.map((step) =>
      step.id === stepId ? { ...step, status: nextStatus } : step,
    )
    updateStepsAndPropagate(updated)

    const step = steps.find((s) => s.id === stepId)
    toast.add({
      title: `Stage marked as ${statusLabels[nextStatus]}`,
      description: `${step?.name} is now ${statusLabels[nextStatus]}.`,
      type: 'success',
    })

    if (nextStatus === 'active' && step && onUpdateStage) {
      onUpdateStage(step.name as CasePipelineCase['stage'])
    }
  }

  function handleAddFile(stepId: string) {
    if (!newFileName.trim()) return

    const newFile: CasePipelineFile = {
      id: `file-${Date.now()}`,
      name: newFileName.trim(),
      type: newFileType,
      size: newFileSize || '1.5 MB',
      uploadedBy: 'Current Lab User',
      uploadedAt: 'Today',
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

    setNewFileName('')
    setUploadDialogState({ stepId: '', isOpen: false })
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
    const blob = new Blob([`Dummy contents for ${file.name}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = file.name
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)

    toast.add({
      title: 'Downloading file',
      description: `Downloading ${file.name} (${file.size}).`,
      type: 'info',
    })
  }

  const completedCount = steps.filter((s) => s.status === 'completed').length

  return (
    <section className="grid gap-3" aria-label="Case workflow stages">
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
                  {step.status !== 'completed' ? (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStepStatusChange(step.id, 'completed')
                      }}
                    >
                      <Check className="text-success" />
                      <span>Mark done</span>
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStepStatusChange(step.id, 'active')
                      }}
                      className="text-text-muted"
                    >
                      <Clock />
                      <span>Re-open</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* ── Stage body ── */}
              <Collapsible.Panel className="stage-body">

                {/* 1. Technicians */}
                <div className="grid gap-2">
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
                            <span>Assign</span>
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
                    <p className="text-xs text-text-muted italic">
                      No technicians assigned yet. Click "Assign" to allocate staff.
                    </p>
                  )}
                </div>

                {/* 2. Files */}
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
                      onClick={() => setUploadDialogState({ stepId: step.id, isOpen: true })}
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
                              <p className="text-sm font-medium text-text-primary truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-text-muted">
                                {file.size} · {file.uploadedBy} · {file.uploadedAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5">
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
                    <div className="empty-state">
                      <p className="text-sm">No files uploaded for this stage yet.</p>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setUploadDialogState({ stepId: step.id, isOpen: true })}
                        className="mt-1.5 text-primary"
                      >
                        + Upload CAD / Scan / Document
                      </Button>
                    </div>
                  )}
                </div>

                {/* 3. Status controls + proceed */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 border-t border-border-soft">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">Stage status:</span>
                    <div className="segmented">
                      {(['pending', 'active', 'completed'] as ProductionStepStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          className="capitalize"
                          aria-pressed={step.status === st}
                          onClick={() => handleStepStatusChange(step.id, st)}
                        >
                          {statusLabels[st]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {index < steps.length - 1 && step.status === 'completed' && (
                    <Button
                      size="xs"
                      variant="soft"
                      onClick={() => {
                        const nextStep = steps[index + 1]
                        if (nextStep) {
                          handleStepStatusChange(nextStep.id, 'active')
                          setOpenStages((cur) => ({ ...cur, [nextStep.id]: true }))
                        }
                      }}
                    >
                      <span>Proceed to {steps[index + 1]?.name}</span>
                    </Button>
                  )}
                </div>
              </Collapsible.Panel>
            </Collapsible.Root>
          )
        })}
      </div>

      {/* ── Add File Dialog ── */}
      <Dialog
        open={uploadDialogState.isOpen}
        onOpenChange={(open) =>
          setUploadDialogState((cur) => ({ ...cur, isOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add file to stage</DialogTitle>
            <DialogDescription>
              Attach a production file, 3D model, scan, or photo.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAddFile(uploadDialogState.stepId)
            }}
            className="grid gap-3 py-2"
          >
            <div className="grid gap-1">
              <Label htmlFor="file-name" className="text-xs font-semibold">
                File name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="file-name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g. upper_aligner_tray_04.stl"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label className="text-xs font-semibold">File type</Label>
                <Select
                  items={[
                    { value: 'STL', label: 'STL (3D Model / Scan)' },
                    { value: 'PDF', label: 'PDF (Prescription / Setup)' },
                    { value: 'IMG', label: 'IMG (Photo / Bite Image)' },
                    { value: 'DOC', label: 'DOC (Worksheet / Notes)' },
                  ]}
                  value={newFileType}
                  onValueChange={(val) =>
                    setNewFileType((val ?? 'STL') as CasePipelineFile['type'])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STL">STL (3D Model / Scan)</SelectItem>
                    <SelectItem value="PDF">PDF (Prescription / Setup)</SelectItem>
                    <SelectItem value="IMG">IMG (Photo / Bite Image)</SelectItem>
                    <SelectItem value="DOC">DOC (Worksheet / Notes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="file-size" className="text-xs font-semibold">
                  Approx size
                </Label>
                <Input
                  id="file-size"
                  value={newFileSize}
                  onChange={(e) => setNewFileSize(e.target.value)}
                  placeholder="e.g. 5.4 MB"
                />
              </div>
            </div>

            {/* Drop zone / browse */}
            <div className="empty-state cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setNewFileName(file.name)
                    const ext = file.name.split('.').pop()?.toUpperCase()
                    if (ext === 'STL' || ext === 'PLY' || ext === 'OBJ') setNewFileType('STL')
                    else if (ext === 'PDF') setNewFileType('PDF')
                    else if (ext === 'JPG' || ext === 'PNG' || ext === 'JPEG') setNewFileType('IMG')
                    setNewFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`)
                  }
                }}
              />
              <Button type="button" variant="neutral" size="sm" className="pointer-events-none">
                <Upload size={13} />
                <span>Browse local file</span>
              </Button>
              <p className="text-xs text-text-muted mt-1.5">
                Supports .stl, .obj, .ply, .pdf, .jpg, .png
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadDialogState({ stepId: '', isOpen: false })}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!newFileName.trim()}>
                Add to stage
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
