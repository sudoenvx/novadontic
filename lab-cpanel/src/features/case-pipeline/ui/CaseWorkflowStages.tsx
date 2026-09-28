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

function getFileIcon(type: CasePipelineFile['type']) {
  switch (type) {
    case 'STL':
      return <Boxes size={16} className="text-primary" />
    case 'IMG':
      return <ImageIcon size={16} className="text-accent" />
    case 'PDF':
      return <FileText size={16} className="text-destructive" />
    case 'DOC':
    default:
      return <FileCode size={16} className="text-secondary" />
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
    // Trigger download of dummy blob content
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

  return (
    <section className="grid gap-3" aria-label="Case Workflow Stages">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-text">Workflow Stages</h2>
          <p className="text-xs text-text-muted">
            Track stage execution, multi-technician assignments, and files as defined in the workflow template.
          </p>
        </div>
        <Badge tone="accent">
          {steps.filter((s) => s.status === 'completed').length} of {steps.length} Stages Completed
        </Badge>
      </div>

      <div className="grid gap-2.5">
        {steps.map((step, index) => {
          const isOpen = openStages[step.id] ?? false
          const assignedTechs = step.technicians ?? (step.technician ? [step.technician] : [])
          const isCurrentActive = step.status === 'active' || step.id === activeStepId

          return (
            <Collapsible.Root
              key={step.id}
              open={isOpen}
              onOpenChange={() => toggleStage(step.id)}
              className={`overflow-hidden rounded-md border transition-all ${isCurrentActive
                ? 'bg-surface  ring-1 ring-accent  '
                : 'border-border bg-neutral-50 border-border'
                }`}
            >
              {/* Stage Header */}
              <div
                className={`flex flex-wrap items-center justify-between gap-2 p-1.5 transition-colors ${isCurrentActive ? 'bg-neutral-100' : 'hover:bg-neutral-100'
                  }`}
              >
                <Collapsible.Trigger className="group flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-primary rounded-sm">
                  {/* Step Index & Status Icon */}
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-sm font-mono text-xs font-bold transition-colors ${step.status === 'completed'
                      ? 'bg-success-soft text-success-soft-foreground'
                      : step.status === 'active'
                        ? 'bg-primary-soft text-primary-soft-foreground'
                        : 'bg-neutral-200 text-text-muted'
                      }`}
                  >
                    {step.status === 'completed' ? (
                      <Check size={14} />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-text text-sm truncate">
                        {step.name}
                      </span>
                    </div>
                    {step.description && (
                      <p className="text-2xs text-text-muted truncate mt-0.5">
                        {step.description}
                      </p>
                    )}
                  </div>

                  {/* Badges preview in header */}
                  <div className="flex items-center gap-2 shrink-0 text-2xs text-text-muted">
                    {assignedTechs.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1 bg-neutral-100 px-2 py-0.5 rounded-sm">
                        <Users size={12} className="text-text-muted" />
                        <span className="font-medium text-text">
                          {assignedTechs.length} {assignedTechs.length === 1 ? 'tech' : 'techs'}
                        </span>
                      </div>
                    )}
                    {step.files.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1 bg-neutral-100 px-2 py-0.5 rounded-sm">
                        <FileCode size={12} className="text-text-muted" />
                        <span className="font-medium text-text">{step.files.length} files</span>
                      </div>
                    )}
                    <ChevronDown
                      size={16}
                      className={`text-text-muted transition-transform duration-150 ${isOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </div>
                </Collapsible.Trigger>

                {/* Quick status actions on header */}
                <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-border-soft">
                  {step.status !== 'completed' ? (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStepStatusChange(step.id, 'completed')
                      }}
                      className="gap-1 text-2xs"
                    >
                      <Check size={12} className="text-success" />
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
                      className="gap-1 text-2xs text-text-muted"
                    >
                      <Clock size={12} />
                      <span>Re-open</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Stage Body (Uncollapsed Content) */}
              <Collapsible.Panel className="border-t border-border bg-surface p-2 grid gap-3.5 text-xs">
                {/* 1. Technicians Multi-Assignment Section */}
                <>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-primary" />
                      <span className="font-semibold text-text text-xs">
                        Assigned Technicians ({assignedTechs.length})
                      </span>
                    </div>

                    {/* Multi-technician assignment dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button size="xs" variant="neutral" className="gap-1 text-2xs">
                            <UserPlus size={12} />
                            <span>Assign Technicians</span>
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
                                className="flex items-center justify-between py-1.5 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="grid size-5 place-items-center rounded-full bg-neutral-200 text-3xs font-semibold uppercase">
                                    {staff.name.slice(0, 2)}
                                  </span>
                                  <span>{staff.name}</span>
                                </div>
                                {isAssigned && (
                                  <UserCheck size={14} className="text-success shrink-0" />
                                )}
                              </DropdownMenuItem>
                            )
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Assigned Technicians Chips */}
                  {assignedTechs.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {assignedTechs.map((techName) => (
                        <Badge
                          key={techName}
                          tone="neutral"
                          className="group/tech inline-flex items-center gap-1.5 py-1 px-2.5 bg-surface border border-border text-xs"
                        >
                          <span className="size-1.5 rounded-full bg-success" />
                          <span className="font-medium text-text">{techName}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTechnician(step.id, techName)}
                            className="text-text-muted hover:text-destructive transition-colors ml-0.5"
                            aria-label={`Unassign ${techName}`}
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-2xs text-text-muted italic">
                      No technicians assigned to this stage yet. Click "Assign Technicians" to allocate staff.
                    </p>
                  )}
                </>

                {/* 2. Stage Files Section */}
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <FileCode size={14} className="text-primary" />
                      <span className="font-semibold text-text text-xs">
                        Stage Files ({step.files.length})
                      </span>
                    </div>

                    <Button
                      size="xs"
                      variant="neutral"
                      onClick={() =>
                        setUploadDialogState({ stepId: step.id, isOpen: true })
                      }
                      className="gap-1 text-2xs"
                    >
                      <Upload size={12} />
                      <span>Add File to Stage</span>
                    </Button>
                  </div>

                  {/* Files List */}
                  {step.files.length > 0 ? (
                    <div className="grid gap-1.5">
                      {step.files.map((file) => (
                        <div
                          key={file.id}
                          className="group/file flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border bg-neutral-50 px-2 py-1 transition-colors hover:bg-neutral-50"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {getFileIcon(file.type)}
                            <div className="min-w-0">
                              <p className="font-medium text-text text-xs truncate">
                                {file.name}
                              </p>
                              <p className="text-3xs text-text-muted">
                                {file.size} · Uploaded by {file.uploadedBy} ({file.uploadedAt})
                              </p>
                            </div>
                          </div>

                          {/* File Actions */}
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => handleDownloadFile(file)}
                              title={`Download ${file.name}`}
                              aria-label={`Download ${file.name}`}
                            >
                              <Download size={13} />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => handleDeleteFile(step.id, file.id, file.name)}
                              className="text-destructive hover:text-destructive"
                              title={`Delete ${file.name}`}
                              aria-label={`Delete ${file.name}`}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-sm border border-dashed border-border p-4 text-center text-2xs text-text-muted">
                      <p>No files uploaded for this stage yet.</p>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          setUploadDialogState({ stepId: step.id, isOpen: true })
                        }
                        className="mt-1.5 text-primary"
                      >
                        + Upload CAD / Scan / Document
                      </Button>
                    </div>
                  )}
                </>

                {/* 3. Stage Progression Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border-soft">
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-text-muted">Stage Status:</span>
                    <div className="flex items-center gap-1">
                      {(['pending', 'active', 'completed'] as ProductionStepStatus[]).map((st) => (
                        <Button
                          key={st}
                          size="xs"
                          variant={step.status === st ? 'default' : 'neutral'}
                          onClick={() => handleStepStatusChange(step.id, st)}
                          className="capitalize text-3xs"
                        >
                          {statusLabels[st]}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {index < steps.length - 1 && step.status === 'completed' && (
                    <Button
                      size="xs"
                      variant="neutral"
                      onClick={() => {
                        const nextStep = steps[index + 1]
                        if (nextStep) {
                          handleStepStatusChange(nextStep.id, 'active')
                          setOpenStages((cur) => ({ ...cur, [nextStep.id]: true }))
                        }
                      }}
                      className="gap-1 text-2xs"
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

      {/* Add File Dialog */}
      <Dialog
        open={uploadDialogState.isOpen}
        onOpenChange={(open) =>
          setUploadDialogState((cur) => ({ ...cur, isOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add File to Stage</DialogTitle>
            <DialogDescription>
              Upload or attach a production file, 3D model, scan, or photo.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAddFile(uploadDialogState.stepId)
            }}
            className="grid gap-3 py-2 text-xs"
          >
            <div className="grid gap-1">
              <Label htmlFor="file-name" className="text-2xs font-semibold">
                File Name <span className="text-destructive">*</span>
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
                <Label className="text-2xs font-semibold">File Type</Label>
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
                  <SelectTrigger className="w-full text-xs">
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
                <Label htmlFor="file-size" className="text-2xs font-semibold">
                  Approx Size
                </Label>
                <Input
                  id="file-size"
                  value={newFileSize}
                  onChange={(e) => setNewFileSize(e.target.value)}
                  placeholder="e.g. 5.4 MB"
                />
              </div>
            </div>

            <div className="rounded-sm border border-dashed border-border bg-neutral-50 p-3 text-center">
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
              <Button
                type="button"
                variant="neutral"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5"
              >
                <Upload size={13} />
                <span>Browse Local File</span>
              </Button>
              <p className="text-3xs text-text-muted mt-1.5">
                Supports .stl, .obj, .ply, .pdf, .jpg, .png
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="neutral"
                onClick={() =>
                  setUploadDialogState({ stepId: '', isOpen: false })
                }
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!newFileName.trim()}>
                Add to Stage
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
