import type { WorkflowFileKind } from '../workflows/workflows.domain.ts';

export type CasePriority = 'Normal' | 'Rush';
export type CaseBillingRule = 'full' | 'discounted' | 'free' | 'warranty';
export type CaseStageStatus = 'pending' | 'active' | 'completed';
export type CaseFieldValue = string | boolean | string[];

export interface CaseStage {
  id: string;
  sourceStageId: string | null;
  sortOrder: number;
  name: string;
  slaHours: number | null;
  requiresApproval: boolean;
  allowedFileKinds: WorkflowFileKind[];
  status: CaseStageStatus;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface CaseRecord {
  id: string;
  patientName: string;
  patientCode: string;
  request: string;
  clinicId: string | null;
  clinicName: string;
  doctorId: string | null;
  doctorName: string;
  applianceTypeId: string | null;
  applianceName: string;
  workflowTemplateId: string | null;
  workflowName: string;
  categoryId: string;
  categoryName: string;
  dueDate: string | null;
  priority: CasePriority;
  priceRule: CaseBillingRule;
  billable: boolean;
  originalCaseId: string | null;
  remakeReason: string | null;
  caseFieldValues: Record<string, CaseFieldValue>;
  arch: string;
  units: number;
  stage: string;
  stages: CaseStage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseListInput {
  search?: string | undefined;
  applianceTypeId?: string | undefined;
  clinicId?: string | undefined;
  priority?: CasePriority | undefined;
  stage?: string | undefined;
  limit: number;
  cursor?: string | undefined;
}

export interface CaseListResult {
  data: CaseRecord[];
  nextCursor: string | null;
  total: number;
}

export interface CreateCaseInput {
  patientName: string;
  patientCode?: string | undefined;
  clinicId?: string | null | undefined;
  doctorId: string;
  applianceTypeId: string;
  workflowTemplateId: string;
  categoryId?: string | undefined;
  categoryName?: string | undefined;
  dueDate?: string | null | undefined;
  priority: CasePriority;
  priceRule: CaseBillingRule;
  billable: boolean;
  originalCaseNumber?: string | null | undefined;
  remakeReason?: string | null | undefined;
  caseFieldValues?: Record<string, CaseFieldValue> | undefined;
}

export interface UpdateCaseInput {
  priority?: CasePriority | undefined;
  dueDate?: string | null | undefined;
  caseFieldValues?: Record<string, CaseFieldValue> | undefined;
}

export interface CasesServiceContract {
  list(input: CaseListInput): Promise<CaseListResult>;
  getByNumber(caseNumber: string): Promise<CaseRecord>;
  create(input: CreateCaseInput, createdById: string): Promise<CaseRecord>;
  update(caseNumber: string, input: UpdateCaseInput): Promise<CaseRecord>;
  updateStageStatus(
    caseNumber: string,
    stageId: string,
    status: Exclude<CaseStageStatus, 'pending'>,
    actorId: string,
  ): Promise<CaseRecord>;
}
