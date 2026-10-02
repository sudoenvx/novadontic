export const workflowFileKinds = ['stl', 'photo', 'pdf', 'doc'] as const;
export type WorkflowFileKind = (typeof workflowFileKinds)[number];

export interface WorkflowStage {
  id: string;
  sortOrder: number;
  name: string;
  slaHours: number | null;
  requiresApproval: boolean;
  allowedFileKinds: WorkflowFileKind[];
}

export interface WorkflowTemplate {
  id: string;
  applianceTypeId: string | null;
  name: string;
  isDefault: boolean;
  stages: WorkflowStage[];
}

export interface WorkflowListInput {
  applianceTypeId?: string | undefined;
}

export interface WorkflowTemplateInput {
  applianceTypeId: string | null;
  name: string;
  isDefault: boolean;
}

export type WorkflowTemplateUpdateInput = Partial<WorkflowTemplateInput>;

export interface WorkflowStageInput {
  name: string;
  slaHours: number | null;
  requiresApproval: boolean;
  allowedFileKinds: WorkflowFileKind[];
}

export type WorkflowStageUpdateInput = Partial<WorkflowStageInput>;

export interface WorkflowsServiceContract {
  list(input: WorkflowListInput): Promise<WorkflowTemplate[]>;
  getById(id: string): Promise<WorkflowTemplate>;
  create(input: WorkflowTemplateInput): Promise<WorkflowTemplate>;
  update(id: string, input: WorkflowTemplateUpdateInput): Promise<WorkflowTemplate>;
  delete(id: string): Promise<void>;
  createStage(templateId: string, input: WorkflowStageInput): Promise<WorkflowStage>;
  updateStage(
    templateId: string,
    stageId: string,
    input: WorkflowStageUpdateInput,
  ): Promise<WorkflowStage>;
  deleteStage(templateId: string, stageId: string): Promise<void>;
  reorderStages(templateId: string, stageIds: string[]): Promise<WorkflowStage[]>;
}
