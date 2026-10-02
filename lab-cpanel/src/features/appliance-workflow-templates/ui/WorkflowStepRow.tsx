import { GripVertical, Pencil, Trash2 } from "lucide-react";

import { Badge } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import type { WorkflowStep } from "../domain/workflowTemplate";

type WorkflowStepRowProps = {
  step: WorkflowStep;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
};

export function WorkflowStepRow({
  step,
  index,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
}: WorkflowStepRowProps) {
  return (
    <div
      className={`group flex items-center gap-2 rounded-md border border-border bg-surface-soft px-2 py-2 transition-colors hover:bg-surface-muted ${isDragging ? "opacity-40" : ""}`}
      draggable
      onDragStart={(event) => onDragStart(event, index)}
      onDragOver={(event) => onDragOver(event, index)}
      onDrop={(event) => onDrop(event, index)}
      onDragEnd={onDragEnd}
    >
      <span
        className="grid size-7 shrink-0 cursor-grab place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground active:cursor-grabbing"
        aria-hidden="true"
      >
        {index + 1}
      </span>
      <GripVertical
        className="shrink-0 text-text-muted"
        size={16}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-text">{step.name}</h3>
          {step.requiresApproval && <Badge tone="warning">Approval gate</Badge>}
        </div>
        <p className="mt-1 truncate text-xs text-text-muted">
          SLA: {step.slaHours === null ? "Not set" : `${step.slaHours} hours`}
          {" · "}Files: {step.allowedFileKinds.map((kind) => kind.toUpperCase()).join(", ")}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="icon-md"
          variant="ghost"
          aria-label={`Edit ${step.name}`}
          onClick={onEdit}
        >
          <Pencil />
        </Button>
        <Button
          size="icon-md"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          aria-label={`Delete ${step.name}`}
          onClick={onDelete}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}

export function WorkflowStepPlaceholder() {
  return (
    <div
      className="flex min-h-14 items-center gap-2 rounded-md bg-surface-soft px-2 py-2"
      aria-hidden="true"
    >
      <span className="size-7 shrink-0 animate-pulse rounded-full bg-surface-muted" />
      <span className="h-3 w-40 animate-pulse rounded-sm bg-surface-muted" />
    </div>
  );
}
