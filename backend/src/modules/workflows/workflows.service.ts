import type { Prisma, PrismaClient } from '../../generated/prisma/client.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import {
  workflowFileKinds,
  type WorkflowFileKind,
  type WorkflowListInput,
  type WorkflowStage,
  type WorkflowStageInput,
  type WorkflowStageUpdateInput,
  type WorkflowTemplate,
  type WorkflowTemplateInput,
  type WorkflowTemplateUpdateInput,
  type WorkflowsServiceContract,
} from './workflows.domain.ts';

const workflowTemplateInclude = {
  stages: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
} satisfies Prisma.WorkflowTemplateInclude;

type WorkflowTemplateRow = Prisma.WorkflowTemplateGetPayload<{
  include: typeof workflowTemplateInclude;
}>;
type WorkflowStageRow = Prisma.WorkflowStageGetPayload<object>;
function toFileKinds(value: Prisma.JsonValue): WorkflowFileKind[] {
  if (!Array.isArray(value)) {
    throw new Error('Stored workflow stage file kinds must be an array of supported values.');
  }
  return value.map((kind) => {
    if (typeof kind !== 'string') {
      throw new Error('Stored workflow stage file kinds must be an array of supported values.');
    }
    const supportedKind = workflowFileKinds.find((candidate) => candidate === kind);
    if (!supportedKind) {
      throw new Error('Stored workflow stage file kinds must be an array of supported values.');
    }
    return supportedKind;
  });
}

function toStage(row: WorkflowStageRow): WorkflowStage {
  return {
    id: row.id.toString(),
    sortOrder: row.sortOrder,
    name: row.name,
    slaHours: row.slaHours,
    requiresApproval: row.requiresApproval,
    allowedFileKinds: toFileKinds(row.allowedFileKinds),
  };
}

function toWorkflow(row: WorkflowTemplateRow): WorkflowTemplate {
  return {
    id: row.id.toString(),
    applianceTypeId: row.applianceTypeId?.toString() ?? null,
    name: row.name,
    isDefault: row.isDefault,
    stages: row.stages.map(toStage),
  };
}

function toFileKindsJson(kinds: WorkflowFileKind[]): Prisma.InputJsonValue {
  return kinds;
}

function isPrismaError(error: unknown, code: string): boolean {
  return error instanceof Error && 'code' in error && error.code === code;
}

function workflowNotFound(): AppError {
  return new AppError('Workflow template was not found', 404, 'WORKFLOW_NOT_FOUND');
}

function stageNotFound(): AppError {
  return new AppError('Workflow stage was not found', 404, 'WORKFLOW_STAGE_NOT_FOUND');
}

function applianceTypeNotFound(): AppError {
  return new AppError('Appliance type was not found', 404, 'APPLIANCE_TYPE_NOT_FOUND');
}

function workflowNameExists(): AppError {
  return new AppError('A workflow template with this name already exists', 409, 'WORKFLOW_NAME_EXISTS');
}

function nextSortOrder(current: number | undefined): number {
  const next = (current ?? -1) + 1;
  if (next > 32_767) {
    throw new AppError('The maximum workflow stage count has been reached', 409, 'WORKFLOW_STAGE_LIMIT_REACHED');
  }
  return next;
}

export class WorkflowsService implements WorkflowsServiceContract {
  constructor(private readonly prisma: PrismaClient) {}

  async list(input: WorkflowListInput): Promise<WorkflowTemplate[]> {
    const rows = await this.prisma.workflowTemplate.findMany({
      ...(input.applianceTypeId ? { where: { applianceTypeId: BigInt(input.applianceTypeId) } } : {}),
      include: workflowTemplateInclude,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    return rows.map(toWorkflow);
  }

  async getById(id: string): Promise<WorkflowTemplate> {
    const row = await this.prisma.workflowTemplate.findUnique({
      where: { id: BigInt(id) },
      include: workflowTemplateInclude,
    });
    if (!row) throw workflowNotFound();
    return toWorkflow(row);
  }

  async create(input: WorkflowTemplateInput): Promise<WorkflowTemplate> {
    if (input.applianceTypeId) await this.assertApplianceTypeExists(input.applianceTypeId);

    try {
      const row = await this.prisma.$transaction(async (transaction) => {
        if (input.isDefault) {
          await transaction.workflowTemplate.updateMany({
            where: { applianceTypeId: input.applianceTypeId ? BigInt(input.applianceTypeId) : null },
            data: { isDefault: false },
          });
        }
        return transaction.workflowTemplate.create({
          data: {
            applianceTypeId: input.applianceTypeId ? BigInt(input.applianceTypeId) : null,
            name: input.name,
            isDefault: input.isDefault,
          },
          include: workflowTemplateInclude,
        });
      });
      return toWorkflow(row);
    } catch (error) {
      if (isPrismaError(error, 'P2002')) throw workflowNameExists();
      throw error;
    }
  }

  async update(id: string, input: WorkflowTemplateUpdateInput): Promise<WorkflowTemplate> {
    const existing = await this.prisma.workflowTemplate.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, applianceTypeId: true, isDefault: true },
    });
    if (!existing) throw workflowNotFound();

    const applianceTypeId = input.applianceTypeId === undefined
      ? existing.applianceTypeId
      : input.applianceTypeId === null ? null : BigInt(input.applianceTypeId);
    if (applianceTypeId !== null && (input.applianceTypeId !== undefined)) {
      await this.assertApplianceTypeExists(applianceTypeId.toString());
    }
    const isDefault = input.isDefault ?? existing.isDefault;

    try {
      const row = await this.prisma.$transaction(async (transaction) => {
        if (isDefault) {
          await transaction.workflowTemplate.updateMany({
            where: {
              applianceTypeId,
              id: { not: existing.id },
            },
            data: { isDefault: false },
          });
        }
        return transaction.workflowTemplate.update({
          where: { id: existing.id },
          data: {
            ...(input.applianceTypeId !== undefined ? { applianceTypeId } : {}),
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.isDefault !== undefined || input.applianceTypeId !== undefined
              ? { isDefault }
              : {}),
          },
          include: workflowTemplateInclude,
        });
      });
      return toWorkflow(row);
    } catch (error) {
      if (isPrismaError(error, 'P2002')) throw workflowNameExists();
      if (isPrismaError(error, 'P2025')) throw workflowNotFound();
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.workflowTemplate.delete({ where: { id: BigInt(id) } });
    } catch (error) {
      if (isPrismaError(error, 'P2025')) throw workflowNotFound();
      throw error;
    }
  }

  async createStage(templateId: string, input: WorkflowStageInput): Promise<WorkflowStage> {
    const template = await this.prisma.workflowTemplate.findUnique({
      where: { id: BigInt(templateId) },
      select: { id: true, stages: { orderBy: { sortOrder: 'desc' }, take: 1, select: { sortOrder: true } } },
    });
    if (!template) throw workflowNotFound();

    try {
      const row = await this.prisma.workflowStage.create({
        data: {
          templateId: template.id,
          sortOrder: nextSortOrder(template.stages[0]?.sortOrder),
          name: input.name,
          slaHours: input.slaHours,
          requiresApproval: input.requiresApproval,
          allowedFileKinds: toFileKindsJson(input.allowedFileKinds),
        },
      });
      return toStage(row);
    } catch (error) {
      if (isPrismaError(error, 'P2003')) throw workflowNotFound();
      throw error;
    }
  }

  async updateStage(
    templateId: string,
    stageId: string,
    input: WorkflowStageUpdateInput,
  ): Promise<WorkflowStage> {
    const existing = await this.prisma.workflowStage.findFirst({
      where: { id: BigInt(stageId), templateId: BigInt(templateId) },
      select: { id: true },
    });
    if (!existing) {
      const template = await this.prisma.workflowTemplate.findUnique({
        where: { id: BigInt(templateId) },
        select: { id: true },
      });
      if (!template) throw workflowNotFound();
      throw stageNotFound();
    }

    try {
      const row = await this.prisma.workflowStage.update({
        where: { id: existing.id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.slaHours !== undefined ? { slaHours: input.slaHours } : {}),
          ...(input.requiresApproval !== undefined ? { requiresApproval: input.requiresApproval } : {}),
          ...(input.allowedFileKinds !== undefined
            ? { allowedFileKinds: toFileKindsJson(input.allowedFileKinds) }
            : {}),
        },
      });
      return toStage(row);
    } catch (error) {
      if (isPrismaError(error, 'P2025')) throw stageNotFound();
      throw error;
    }
  }

  async deleteStage(templateId: string, stageId: string): Promise<void> {
    const result = await this.prisma.workflowStage.deleteMany({
      where: { id: BigInt(stageId), templateId: BigInt(templateId) },
    });
    if (result.count > 0) return;
    const template = await this.prisma.workflowTemplate.findUnique({
      where: { id: BigInt(templateId) },
      select: { id: true },
    });
    if (!template) throw workflowNotFound();
    throw stageNotFound();
  }

  async reorderStages(templateId: string, stageIds: string[]): Promise<WorkflowStage[]> {
    const template = await this.prisma.workflowTemplate.findUnique({
      where: { id: BigInt(templateId) },
      select: { id: true, stages: { select: { id: true, sortOrder: true } } },
    });
    if (!template) throw workflowNotFound();

    const existingIds = template.stages.map((stage) => stage.id.toString());
    const requestedIds = new Set(stageIds);
    if (
      stageIds.length !== existingIds.length ||
      requestedIds.size !== stageIds.length ||
      existingIds.some((id) => !requestedIds.has(id))
    ) {
      throw new AppError(
        'Stage ids must include every stage in this workflow exactly once',
        422,
        'INVALID_WORKFLOW_STAGE_ORDER',
      );
    }

    await this.prisma.$transaction(async (transaction) => {
      for (let index = 0; index < stageIds.length; index += 1) {
        const stageId = stageIds[index];
        if (stageId === undefined) continue;
        await transaction.workflowStage.update({
          where: { id: BigInt(stageId) },
          data: { sortOrder: -(index + 1) },
        });
      }
      for (let index = 0; index < stageIds.length; index += 1) {
        const stageId = stageIds[index];
        if (stageId === undefined) continue;
        await transaction.workflowStage.update({
          where: { id: BigInt(stageId) },
          data: { sortOrder: index },
        });
      }
    });
    return (await this.getById(templateId)).stages;
  }

  private async assertApplianceTypeExists(id: string): Promise<void> {
    const applianceType = await this.prisma.applianceType.findUnique({
      where: { id: BigInt(id) },
      select: { id: true },
    });
    if (!applianceType) throw applianceTypeNotFound();
  }
}
