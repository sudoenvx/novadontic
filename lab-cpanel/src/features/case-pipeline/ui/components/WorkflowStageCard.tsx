import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '../../../../shared/ui/Collapsible'
import { Badge, type BadgeTone } from '../../../../shared/ui/Badge'
import { Button } from '../../../../shared/ui/Button'
import { Check, ChevronDown, Clock, FileCode, Users } from 'lucide-react'
import type { CaseProductionStep, ProductionStepStatus } from '../../domain/casePipeline'
import type { EditingStageFile } from './StageFiles'
import { StageFiles } from './StageFiles'
import { StageTechnicians } from './StageTechnicians'

type WorkflowStageCardProps = {
  step: CaseProductionStep
  index: number
  isOpen: boolean
  isActive: boolean
  editingFile?: EditingStageFile
  onOpenChange: (open: boolean) => void
  onStatusChange: (status: 'active' | 'completed') => void
  onAssignTechnician: (name: string) => void
  onRemoveTechnician: (name: string) => void
  onSelectFile: (file: File, stepId: string) => void
  onStartRename: (file: CaseProductionStep['files'][number]) => void
  onRename: (fileId: string) => void
  onCancelRename: () => void
  onRenameChange: (name: string) => void
  onDownloadFile: (file: CaseProductionStep['files'][number]) => void
  onDeleteFile: (file: CaseProductionStep['files'][number]) => void
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

export function WorkflowStageCard({
  step,
  index,
  isOpen,
  isActive,
  editingFile,
  onOpenChange,
  onStatusChange,
  onAssignTechnician,
  onRemoveTechnician,
  onSelectFile,
  onStartRename,
  onRename,
  onCancelRename,
  onRenameChange,
  onDownloadFile,
  onDeleteFile,
}: WorkflowStageCardProps) {
  const technicians = step.technicians ?? (step.technician ? [step.technician] : [])

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onOpenChange}
      className={['stage overflow-hidden transition-all', isActive ? 'is-open' : ''].join(' ')}
    >
      <div className={['stage-head justify-between', isActive ? 'bg-primary-soft/40' : ''].join(' ')}>
        <CollapsibleTrigger className="group flex min-w-0 flex-1 items-center gap-3 rounded-xs text-left">
          <span
            className={[
              'step-node shrink-0 font-mono text-xs font-extrabold transition-colors',
              step.status === 'completed' ? 'bg-none bg-success text-success-foreground is-done' : '',
              step.status === 'active' ? 'is-now' : '',
            ].join(' ')}
          >
            {step.status === 'completed' ? <Check size={12} /> : index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-semibold text-text-primary">{step.name}</span>
              <Badge tone={statusTone[step.status]} className="text-xs">
                {statusLabels[step.status]}
              </Badge>
            </div>
            {step.description && (
              <p className="mt-0.5 truncate text-xs text-text-secondary">{step.description}</p>
            )}
          </div>
          <div className="hidden shrink-0 items-center gap-1.5 text-xs text-text-muted sm:flex">
            {technicians.length > 0 && (
              <span className="pill"><Users size={11} />{technicians.length}</span>
            )}
            {step.files.length > 0 && (
              <span className="pill"><FileCode size={11} />{step.files.length}</span>
            )}
            <ChevronDown
              size={15}
              className={`text-text-muted transition-transform duration-(--duration-base) ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </CollapsibleTrigger>
        <div className="flex shrink-0 items-center gap-1 border-l border-border-soft pl-2">
          {step.status === 'active' ? (
            <Button size="xs" variant="soft" onClick={(event) => { event.stopPropagation(); onStatusChange('completed') }}>
              <Check className="text-success" />
              <span>Mark done</span>
            </Button>
          ) : step.status === 'completed' ? (
            <Button size="xs" variant="outline" onClick={(event) => { event.stopPropagation(); onStatusChange('active') }}>
              <Clock />
              <span>Re-open</span>
            </Button>
          ) : (
            <Button size="xs" variant="outline" onClick={(event) => { event.stopPropagation(); onStatusChange('active') }}>
              <Clock />
              <span>Start stage</span>
            </Button>
          )}
        </div>
      </div>

      <CollapsiblePanel className="stage-body">
        <div className="grid gap-3">
          <StageTechnicians
            technicians={technicians}
            onAssign={onAssignTechnician}
            onRemove={onRemoveTechnician}
          />
          <StageFiles
            stepId={step.id}
            files={step.files}
            editingFile={editingFile}
            onSelectFile={onSelectFile}
            onStartRename={onStartRename}
            onRename={onRename}
            onCancelRename={onCancelRename}
            onRenameChange={onRenameChange}
            onDownload={onDownloadFile}
            onDelete={onDeleteFile}
          />
        </div>
      </CollapsiblePanel>
    </Collapsible>
  )
}
