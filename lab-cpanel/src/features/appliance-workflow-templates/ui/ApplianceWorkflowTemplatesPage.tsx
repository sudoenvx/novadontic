import { Plus, Workflow } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import { PageHeader, PageHeaderActions } from "../../../shared/ui/PageHeader";
import { Card } from "../../../shared/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/Dialog";
import { Page } from "../../../shared/ui/Page";
import { Switch } from "../../../shared/ui/Switch";
import { toast } from "../../../shared/ui/Toast";
import { appliances } from "../../appliances/data/appliances";
import {
  getWorkflowDuration,
  getWorkflowStepCount,
  moveWorkflowStep,
  type WorkflowStep,
  type WorkflowTemplate,
} from "../domain/workflowTemplate";
import { workflowTemplateFixtures } from "../data/workflowTemplates";
import { CreateWorkflowDialog } from "./CreateWorkflowDialog";
import { WorkflowStepFormCard } from "./WorkflowStepFormCard";
import { WorkflowStepPlaceholder, WorkflowStepRow } from "./WorkflowStepRow";
import { WorkflowSummary } from "./WorkflowSummary";

type StepFormState = { workflowId: string; step?: WorkflowStep };
type StepDeleteState = { workflowId: string; step: WorkflowStep };

export function ApplianceWorkflowTemplatesPage() {
  const [selectedApplianceId, setSelectedApplianceId] = useState(
    appliances[0]?.id ?? "",
  );
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(
    workflowTemplateFixtures[0]?.id ?? "",
  );
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>(
    workflowTemplateFixtures,
  );
  const [isCreateWorkflowOpen, setIsCreateWorkflowOpen] = useState(false);
  const [stepForm, setStepForm] = useState<StepFormState>();
  const [stepToDelete, setStepToDelete] = useState<StepDeleteState>();
  const [draggedStepId, setDraggedStepId] = useState<string>();
  const [dragOverIndex, setDragOverIndex] = useState<number>();

  const selectedAppliance =
    appliances.find((appliance) => appliance.id === selectedApplianceId) ??
    appliances[0];
  const applianceWorkflows = useMemo(
    () =>
      workflows.filter(
        (workflow) => workflow.applianceId === selectedAppliance?.id,
      ),
    [selectedAppliance?.id, workflows],
  );
  const selectedWorkflow =
    applianceWorkflows.find((workflow) => workflow.id === selectedWorkflowId) ??
    applianceWorkflows[0];

  function selectAppliance(applianceId: string) {
    setSelectedApplianceId(applianceId);
    setSelectedWorkflowId(
      workflows.find((workflow) => workflow.applianceId === applianceId)?.id ??
        "",
    );
    setStepForm(undefined);
  }

  function handleCreateWorkflow(name: string, isDefault: boolean) {
    if (!selectedAppliance) return;
    const workflow: WorkflowTemplate = {
      id: `${selectedAppliance.id}-workflow-${Date.now()}`,
      applianceId: selectedAppliance.id,
      name,
      isDefault: isDefault || applianceWorkflows.length === 0,
      isActive: true,
      steps: [],
    };
    setWorkflows((current) => [
      ...current.map((item) =>
        item.applianceId === workflow.applianceId && workflow.isDefault
          ? { ...item, isDefault: false }
          : item,
      ),
      workflow,
    ]);
    setSelectedWorkflowId(workflow.id);
    toast.add({
      title: "Workflow created",
      description: `${workflow.name} is ready for production steps.`,
      type: "success",
    });
  }

  function handleSaveStep(step: WorkflowStep) {
    if (!stepForm) return;
    setWorkflows((current) =>
      current.map((workflow) => {
        if (workflow.id !== stepForm.workflowId) return workflow;
        const hasStep = workflow.steps.some((item) => item.id === step.id);
        return {
          ...workflow,
          steps: hasStep
            ? workflow.steps.map((item) => (item.id === step.id ? step : item))
            : [...workflow.steps, step],
        };
      }),
    );
    setStepForm(undefined);
    toast.add({
      title: stepForm.step ? "Step updated" : "Step added",
      type: "success",
    });
  }

  function handleDeleteStep() {
    if (!stepToDelete) return;
    setWorkflows((current) =>
      current.map((workflow) =>
        workflow.id === stepToDelete.workflowId
          ? {
              ...workflow,
              steps: workflow.steps.filter(
                (step) => step.id !== stepToDelete.step.id,
              ),
            }
          : workflow,
      ),
    );
    toast.add({
      title: "Step removed",
      description: stepToDelete.step.name,
      type: "success",
    });
    setStepToDelete(undefined);
  }

  function handleStepDragStart(
    event: React.DragEvent<HTMLDivElement>,
    stepIndex: number,
  ) {
    if (!selectedWorkflow) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "text/plain",
      selectedWorkflow.steps[stepIndex].id,
    );
    setDraggedStepId(selectedWorkflow.steps[stepIndex].id);
    setDragOverIndex(stepIndex);
  }

  function handleStepDragOver(
    event: React.DragEvent<HTMLDivElement>,
    stepIndex: number,
  ) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (stepIndex !== dragOverIndex) setDragOverIndex(stepIndex);
  }

  function handleStepDrop(
    event: React.DragEvent<HTMLDivElement>,
    targetIndex: number,
  ) {
    event.preventDefault();
    if (!selectedWorkflow || !draggedStepId) return;

    const sourceIndex = selectedWorkflow.steps.findIndex(
      (step) => step.id === draggedStepId,
    );
    if (sourceIndex === -1) return;

    setWorkflows((current) =>
      current.map((workflow) => {
        if (workflow.id !== selectedWorkflow.id) return workflow;
        return {
          ...workflow,
          steps: moveWorkflowStep(workflow.steps, sourceIndex, targetIndex),
        };
      }),
    );
    setDraggedStepId(undefined);
    setDragOverIndex(undefined);
  }

  function handleStepDragEnd() {
    setDraggedStepId(undefined);
    setDragOverIndex(undefined);
  }

  function setDefaultWorkflow(workflowId: string) {
    setWorkflows((current) =>
      current.map((workflow) =>
        workflow.applianceId === selectedAppliance?.id
          ? { ...workflow, isDefault: workflow.id === workflowId }
          : workflow,
      ),
    );
    toast.add({ title: "Default workflow updated", type: "success" });
  }

  function toggleWorkflow(workflowId: string) {
    setWorkflows((current) =>
      current.map((workflow) =>
        workflow.id === workflowId
          ? { ...workflow, isActive: !workflow.isActive }
          : workflow,
      ),
    );
  }

  return (
    <Page size="full">
      <PageHeader
        title="Workflow templates"
        description="Define reusable production steps for every appliance type in your lab."
      >
        <PageHeaderActions>
          <Button
            onClick={() => setIsCreateWorkflowOpen(true)}
            disabled={!selectedAppliance}
          >
            <Plus /> Add workflow
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <div className="grid min-w-0 gap-3 xl:grid-cols-[15rem_minmax(0,1fr)]">
        <Card className="h-fit gap-2 xl:sticky xl:top-[calc(var(--navbar-height)+var(--page-gap))] xl:self-start">
          <div className="px-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Appliance types
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Choose where to configure a workflow.
            </p>
          </div>
          <div className="grid gap-1">
            {appliances.map((appliance) => {
              const count = workflows.filter(
                (workflow) => workflow.applianceId === appliance.id,
              ).length;
              return (
                <button
                  key={appliance.id}
                  type="button"
                  className={`flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-text-primary transition-colors ${selectedAppliance?.id === appliance.id ? "bg-primary-soft text-primary-soft-foreground" : "hover:bg-surface-muted hover:text-text-primary"}`}
                  onClick={() => selectAppliance(appliance.id)}
                >

                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {appliance.name}
                  </span>
                  <span className="text-sm font-mono text-text-secondary">{count}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="grid min-w-0 gap-3">
          {selectedAppliance && applianceWorkflows.length > 0 && (
            <div className="grid min-w-0 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
              {applianceWorkflows.map((workflow) => (
                <button
                  key={workflow.id}
                  type="button"
                  aria-pressed={selectedWorkflow?.id === workflow.id}
                  className={`flex min-h-16 min-w-0 items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${selectedWorkflow?.id === workflow.id ? "border-primary bg-primary-soft shadow-ring-active" : "border-border bg-surface hover:border-border-strong hover:bg-surface-muted"}`}
                  onClick={() => {
                    setSelectedWorkflowId(workflow.id);
                    setStepForm(undefined);
                  }}
                >

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-text-primary">
                        {workflow.name}
                      </span>
                      {workflow.isDefault && <Badge tone="accent">Default</Badge>}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-text-muted">
                      <span>{getWorkflowStepCount(workflow)} steps</span>
                      <span>·</span>
                      <span>{getWorkflowDuration(workflow)} days</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {selectedWorkflow ? (
            <>
              {stepForm && selectedWorkflow.id === stepForm.workflowId && (
                <WorkflowStepFormCard
                  key={stepForm.step?.id ?? "new-step"}
                  step={stepForm.step}
                  onSave={handleSaveStep}
                  onCancel={() => setStepForm(undefined)}
                />
              )}
              <Card className="gap-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-text">
                        {selectedWorkflow.name}
                      </h2>

                    </div>
                    <p className="mt-1 text-sm text-text-muted">
                      {selectedAppliance?.name} · The order below becomes the
                      production path for new cases.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-text-secondary">
                      <Switch
                        size="sm"
                        checked={selectedWorkflow.isActive}
                        onCheckedChange={() =>
                          toggleWorkflow(selectedWorkflow.id)
                        }
                        aria-label="Workflow active"
                      />{" "}
                      Active
                    </label>
                    {!selectedWorkflow.isDefault && (
                      <Button
                        variant="neutral"
                        onClick={() => setDefaultWorkflow(selectedWorkflow.id)}
                      >
                        Make default
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <WorkflowSummary
                    label="Production steps"
                    value={String(getWorkflowStepCount(selectedWorkflow))}
                  />
                  <WorkflowSummary
                    label="Estimated duration"
                    value={`${getWorkflowDuration(selectedWorkflow)} days`}
                  />
                  <WorkflowSummary
                    label="Approval gates"
                    value={String(
                      selectedWorkflow.steps.filter(
                        (step) => step.requiresApproval,
                      ).length,
                    )}
                  />
                </div>
              </Card>

              <Card className="gap-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-text">
                      Production steps
                    </h2>
                    <p className="mt-1 text-sm text-text-muted">
                      Arrange the stages your team follows from case intake to
                      delivery.
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      setStepForm({ workflowId: selectedWorkflow.id })
                    }
                  >
                    <Plus /> Add step
                  </Button>
                </div>
                {selectedWorkflow.steps.length > 0 ? (
                  <div
                    className="grid gap-2"
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (event.currentTarget !== event.target) return;
                      if (draggedStepId)
                        setDragOverIndex(selectedWorkflow.steps.length);
                    }}
                    onDrop={(event) => {
                      if (event.currentTarget === event.target) {
                        handleStepDrop(event, selectedWorkflow.steps.length);
                      }
                    }}
                  >
                    {selectedWorkflow.steps.map((step, index) => (
                      <div key={step.id} className="grid gap-2">
                        {dragOverIndex === index &&
                          draggedStepId !== step.id && (
                            <div
                              onDragOver={(event) => handleStepDragOver(event, index)}
                              onDrop={(event) => handleStepDrop(event, index)}
                            >
                              <WorkflowStepPlaceholder />
                            </div>
                          )}
                        <WorkflowStepRow
                          step={step}
                          index={index}
                          onEdit={() =>
                            setStepForm({
                              workflowId: selectedWorkflow.id,
                              step,
                            })
                          }
                          onDelete={() =>
                            setStepToDelete({
                              workflowId: selectedWorkflow.id,
                              step,
                            })
                          }
                          onDragStart={handleStepDragStart}
                          onDragOver={handleStepDragOver}
                          onDrop={handleStepDrop}
                          onDragEnd={handleStepDragEnd}
                          isDragging={draggedStepId === step.id}
                        />
                      </div>
                    ))}
                    {dragOverIndex === selectedWorkflow.steps.length && (
                      <div
                        onDragOver={(event) =>
                          handleStepDragOver(event, selectedWorkflow.steps.length)
                        }
                        onDrop={(event) =>
                          handleStepDrop(event, selectedWorkflow.steps.length)
                        }
                      >
                        <WorkflowStepPlaceholder />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md bg-surface-muted px-2 py-2 text-center">
                    <p className="text-sm font-semibold text-text">
                      No production steps yet
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      Add the first stage to start building this workflow.
                    </p>
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card className="items-center justify-center gap-2 text-center">
              <Workflow className="text-text-muted" />
              <p className="font-medium text-text">No workflow configured</p>
              <p className="text-sm text-text-muted">
                Create a workflow for{" "}
                {selectedAppliance?.name ?? "this appliance"} to define its
                production path.
              </p>
              <Button
                className="mt-2"
                onClick={() => setIsCreateWorkflowOpen(true)}
              >
                <Plus /> Add workflow
              </Button>
            </Card>
          )}
        </div>
      </div>

      {selectedAppliance && (
        <CreateWorkflowDialog
          open={isCreateWorkflowOpen}
          applianceName={selectedAppliance.name}
          onOpenChange={setIsCreateWorkflowOpen}
          onCreate={handleCreateWorkflow}
        />
      )}
      <Dialog
        open={Boolean(stepToDelete)}
        onOpenChange={(open) => !open && setStepToDelete(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete production step?</DialogTitle>
            <DialogDescription>
              {stepToDelete
                ? `Remove “${stepToDelete.step.name}” from this workflow? Existing cases will keep their current progress.`
                : "This production step will be removed from the template."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="neutral"
              onClick={() => setStepToDelete(undefined)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStep}>
              Delete step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}

