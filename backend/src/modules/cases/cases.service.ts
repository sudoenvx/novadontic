import type { Prisma, PrismaClient } from '../../generated/prisma/client.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import type { WorkflowFileKind } from '../workflows/workflows.domain.ts';
import type {
  CaseBillingRule,
  CaseFieldValue,
  CaseListInput,
  CaseListResult,
  CasePriority,
  CaseRecord,
  CaseStage,
  CaseStageStatus,
  CasesServiceContract,
  CreateCaseInput,
  UpdateCaseInput,
} from './cases.domain.ts';

const caseInclude = {
  stages: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
  originalCase: { select: { caseNumber: true } },
} satisfies Prisma.CaseRecordInclude;

type CaseRow = Prisma.CaseRecordGetPayload<{ include: typeof caseInclude }>;
type CaseStageRow = Prisma.CaseStageGetPayload<object>;
const supportedFileKinds: readonly WorkflowFileKind[] = ['stl', 'photo', 'pdf', 'doc'];
const priorities: readonly CasePriority[] = ['Normal', 'Rush'];
const billingRules: readonly CaseBillingRule[] = ['full', 'discounted', 'free', 'warranty'];
const stageStatuses: readonly CaseStageStatus[] = ['pending', 'active', 'completed'];

function invalidStoredValue(resource: string): Error {
  return new Error(`Stored ${resource} has an unsupported value.`);
}

function toAllowedFileKinds(value: Prisma.JsonValue): WorkflowFileKind[] {
  if (!Array.isArray(value)) throw invalidStoredValue('case stage file kinds');
  return value.map((kind) => {
    if (typeof kind !== 'string') {
      throw invalidStoredValue('case stage file kinds');
    }
    const fileKind = supportedFileKinds.find((candidate) => candidate === kind);
    if (!fileKind) throw invalidStoredValue('case stage file kinds');
    return fileKind;
  });
}

function toCaseFieldValues(value: Prisma.JsonValue): Record<string, CaseFieldValue> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw invalidStoredValue('case field values');
  }
  const values: Record<string, CaseFieldValue> = {};
  for (const [key, fieldValue] of Object.entries(value)) {
    if (typeof fieldValue === 'string' || typeof fieldValue === 'boolean') {
      values[key] = fieldValue;
    } else if (
      Array.isArray(fieldValue) &&
      fieldValue.every((item) => typeof item === 'string')
    ) {
      values[key] = fieldValue;
    } else {
      throw invalidStoredValue('case field values');
    }
  }
  return values;
}

function toStage(row: CaseStageRow): CaseStage {
  if (!stageStatuses.includes(row.status as CaseStageStatus)) {
    throw invalidStoredValue('case stage status');
  }
  return {
    id: row.id.toString(),
    sourceStageId: row.sourceStageId?.toString() ?? null,
    sortOrder: row.sortOrder,
    name: row.name,
    slaHours: row.slaHours,
    requiresApproval: row.requiresApproval,
    allowedFileKinds: toAllowedFileKinds(row.allowedFileKinds),
    status: row.status as CaseStageStatus,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
  };
}

function currentStageName(stages: CaseStage[]): string {
  const activeStage = stages.find((stage) => stage.status === 'active');
  if (activeStage) return activeStage.name;
  const lastCompletedStage = [...stages].reverse().find((stage) => stage.status === 'completed');
  return lastCompletedStage?.name ?? stages[0]?.name ?? 'Received';
}

function toCase(row: CaseRow): CaseRecord {
  if (!row.caseNumber) throw new Error('Persisted case is missing its case number.');
  if (!priorities.includes(row.priority as CasePriority)) {
    throw invalidStoredValue('case priority');
  }
  if (!billingRules.includes(row.priceRule as CaseBillingRule)) {
    throw invalidStoredValue('case billing rule');
  }
  const stages = row.stages.map(toStage);
  return {
    id: row.caseNumber,
    patientName: row.patientName,
    patientCode: row.patientCode ?? '',
    request: row.request ?? '',
    clinicId: row.clinicId?.toString() ?? null,
    clinicName: row.clinicName ?? 'Portal request',
    doctorId: row.doctorId?.toString() ?? null,
    doctorName: row.doctorName ?? 'Unassigned doctor',
    applianceTypeId: row.applianceTypeId?.toString() ?? null,
    applianceName: row.applianceName ?? 'Appliance case',
    workflowTemplateId: row.workflowTemplateId?.toString() ?? null,
    workflowName: row.workflowName ?? '',
    categoryId: row.categoryId ?? '',
    categoryName: row.categoryName ?? 'New case',
    dueDate: row.dueDate?.toISOString().slice(0, 10) ?? null,
    priority: row.priority as CasePriority,
    priceRule: row.priceRule as CaseBillingRule,
    billable: row.billable,
    originalCaseId: row.originalCase?.caseNumber ?? null,
    remakeReason: row.remakeReason,
    caseFieldValues: toCaseFieldValues(row.caseFieldValues),
    arch: row.arch ?? 'Not provided',
    units: row.units,
    stage: currentStageName(stages),
    stages,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function caseNotFound(): AppError {
  return new AppError('Case was not found', 404, 'CASE_NOT_FOUND');
}

function isPrismaError(error: unknown, code: string): boolean {
  return error instanceof Error && 'code' in error && error.code === code;
}

function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function toFieldValuesJson(
  values: Record<string, CaseFieldValue> | undefined,
): Prisma.InputJsonValue {
  return values ?? {};
}

export class CasesService implements CasesServiceContract {
  constructor(private readonly prisma: PrismaClient) {}

  async list(input: CaseListInput): Promise<CaseListResult> {
    const filters: Prisma.CaseRecordWhereInput = {
      ...(input.priority ? { priority: input.priority } : {}),
      ...(input.applianceTypeId ? { applianceTypeId: BigInt(input.applianceTypeId) } : {}),
      ...(input.clinicId ? { clinicId: BigInt(input.clinicId) } : {}),
      ...(input.stage ? { stages: { some: { name: input.stage } } } : {}),
      ...(input.search
        ? {
            OR: [
              { caseNumber: { contains: input.search } },
              { patientName: { contains: input.search } },
              { patientCode: { contains: input.search } },
              { clinicName: { contains: input.search } },
              { doctorName: { contains: input.search } },
            ],
          }
        : {}),
    };
    const where: Prisma.CaseRecordWhereInput = {
      ...filters,
      ...(input.cursor ? { id: { gt: BigInt(input.cursor) } } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.caseRecord.findMany({
        where,
        include: caseInclude,
        orderBy: { id: 'asc' },
        take: input.limit + 1,
      }),
      this.prisma.caseRecord.count({ where: filters }),
    ]);
    const hasMore = rows.length > input.limit;
    const data = rows.slice(0, input.limit).map(toCase);
    return {
      data,
      nextCursor: hasMore ? rows[input.limit - 1]?.id.toString() ?? null : null,
      total,
    };
  }

  async getByNumber(caseNumber: string): Promise<CaseRecord> {
    const row = await this.prisma.caseRecord.findUnique({
      where: { caseNumber },
      include: caseInclude,
    });
    if (!row) throw caseNotFound();
    return toCase(row);
  }

  async create(input: CreateCaseInput, createdById: string): Promise<CaseRecord> {
    const row = await this.prisma.$transaction(async (transaction) => {
      const [appliance, workflow, doctor, clinic, originalCase] = await Promise.all([
        transaction.applianceType.findUnique({
          where: { id: BigInt(input.applianceTypeId) },
          select: { id: true, name: true, isActive: true },
        }),
        transaction.workflowTemplate.findUnique({
          where: { id: BigInt(input.workflowTemplateId) },
          include: { stages: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
        }),
        transaction.doctor.findUnique({
          where: { id: BigInt(input.doctorId) },
          select: {
            id: true,
            fullName: true,
            isActive: true,
            clinics: { select: { clinicId: true } },
          },
        }),
        input.clinicId
          ? transaction.clinic.findUnique({
              where: { id: BigInt(input.clinicId) },
              select: { id: true, name: true, isActive: true },
            })
          : Promise.resolve(null),
        input.originalCaseNumber
          ? transaction.caseRecord.findUnique({
              where: { caseNumber: input.originalCaseNumber },
              select: { id: true },
            })
          : Promise.resolve(null),
      ]);

      if (!appliance) throw new AppError('Appliance type was not found', 404, 'APPLIANCE_TYPE_NOT_FOUND');
      if (!appliance.isActive) throw new AppError('Appliance type is inactive', 409, 'APPLIANCE_TYPE_INACTIVE');
      if (!workflow) throw new AppError('Workflow template was not found', 404, 'WORKFLOW_NOT_FOUND');
      if (workflow.applianceTypeId !== null && workflow.applianceTypeId !== appliance.id) {
        throw new AppError('Workflow template does not belong to this appliance type', 422, 'WORKFLOW_APPLIANCE_MISMATCH');
      }
      if (!doctor) throw new AppError('Doctor was not found', 404, 'DOCTOR_NOT_FOUND');
      if (!doctor.isActive) throw new AppError('Doctor is inactive', 409, 'DOCTOR_INACTIVE');
      if (input.clinicId && !clinic) {
        throw new AppError('Clinic was not found', 404, 'CLINIC_NOT_FOUND');
      }
      if (clinic && !clinic.isActive) {
        throw new AppError('Clinic is inactive', 409, 'CLINIC_INACTIVE');
      }
      if (
        clinic &&
        !doctor.clinics.some(({ clinicId }) => clinicId === clinic.id)
      ) {
        throw new AppError('Doctor is not associated with the selected clinic', 422, 'DOCTOR_CLINIC_MISMATCH');
      }
      if (input.originalCaseNumber && !originalCase) {
        throw new AppError('Original case was not found', 404, 'ORIGINAL_CASE_NOT_FOUND');
      }

      const categoryName = input.categoryName ?? 'New case';
      const record = await transaction.caseRecord.create({
        data: {
          patientName: input.patientName,
          patientCode: input.patientCode || null,
          request: `${categoryName} · ${appliance.name}`,
          clinicId: clinic?.id ?? null,
          clinicName: clinic?.name ?? 'Portal request',
          doctorId: doctor.id,
          doctorName: doctor.fullName,
          applianceTypeId: appliance.id,
          applianceName: appliance.name,
          workflowTemplateId: workflow.id,
          workflowName: workflow.name,
          categoryId: input.categoryId ?? 'new',
          categoryName,
          dueDate: toDate(input.dueDate),
          priority: input.priority,
          priceRule: input.priceRule,
          billable: input.billable,
          originalCaseId: originalCase?.id ?? null,
          remakeReason: input.remakeReason ?? null,
          caseFieldValues: toFieldValuesJson(input.caseFieldValues),
          createdById: BigInt(createdById),
          stages: {
            create: workflow.stages.map((stage, index) => ({
              sourceStageId: stage.id,
              sortOrder: index,
              name: stage.name,
              slaHours: stage.slaHours,
              requiresApproval: stage.requiresApproval,
              allowedFileKinds: toAllowedFileKinds(stage.allowedFileKinds),
              status: index === 0 ? 'active' : 'pending',
              startedAt: index === 0 ? new Date() : null,
            })),
          },
        },
        select: { id: true },
      });
      const caseNumber = `OR-${record.id.toString().padStart(6, '0')}`;
      const createdCase = await transaction.caseRecord.update({
        where: { id: record.id },
        data: { caseNumber },
        include: caseInclude,
      });
      const actor = await transaction.user.findUnique({
        where: { id: BigInt(createdById) },
        select: { fullName: true },
      });
      await transaction.caseTimelineEntry.create({
        data: {
          caseId: record.id,
          kind: 'event',
          eventType: 'case_created',
          message: 'Case received',
          actorId: BigInt(createdById),
          actorName: actor?.fullName ?? 'Lab team',
          createdAt: createdCase.createdAt,
        },
      });
      return createdCase;
    });
    return toCase(row);
  }

  async update(caseNumber: string, input: UpdateCaseInput): Promise<CaseRecord> {
    try {
      const row = await this.prisma.caseRecord.update({
        where: { caseNumber },
        data: {
          ...(input.priority !== undefined ? { priority: input.priority } : {}),
          ...(input.dueDate !== undefined ? { dueDate: toDate(input.dueDate) } : {}),
          ...(input.caseFieldValues !== undefined
            ? { caseFieldValues: toFieldValuesJson(input.caseFieldValues) }
            : {}),
        },
        include: caseInclude,
      });
      return toCase(row);
    } catch (error) {
      if (isPrismaError(error, 'P2025')) throw caseNotFound();
      throw error;
    }
  }

  async updateStageStatus(
    caseNumber: string,
    stageId: string,
    status: Exclude<CaseStageStatus, 'pending'>,
    actorId: string,
  ): Promise<CaseRecord> {
    await this.prisma.$transaction(async (transaction) => {
      const caseRecord = await transaction.caseRecord.findUnique({
        where: { caseNumber },
        select: { id: true, stages: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
      });
      if (!caseRecord) throw caseNotFound();
      const stageIndex = caseRecord.stages.findIndex((stage) => stage.id === BigInt(stageId));
      if (stageIndex < 0) {
        throw new AppError('Case stage was not found', 404, 'CASE_STAGE_NOT_FOUND');
      }
      const stage = caseRecord.stages[stageIndex];
      if (!stage) throw new Error('Case stage lookup returned an invalid index.');

      await transaction.caseStage.updateMany({
        where: { caseId: caseRecord.id, status: 'active', id: { not: stage.id } },
        data: { status: 'pending', completedAt: null },
      });
      await transaction.caseStage.update({
        where: { id: stage.id },
        data: {
          status,
          startedAt: stage.startedAt ?? new Date(),
          completedAt: status === 'completed' ? new Date() : null,
        },
      });

      if (status === 'completed') {
        const nextStage = caseRecord.stages
          .slice(stageIndex + 1)
          .find((item) => item.status !== 'completed');
        if (nextStage) {
          await transaction.caseStage.update({
            where: { id: nextStage.id },
            data: { status: 'active', startedAt: nextStage.startedAt ?? new Date() },
          });
        }
      }

      if (stage.status !== status) {
        const actor = await transaction.user.findUnique({
          where: { id: BigInt(actorId) },
          select: { fullName: true },
        });
        await transaction.caseTimelineEntry.create({
          data: {
            caseId: caseRecord.id,
            kind: 'event',
            eventType: 'case_stage_status_changed',
            message: status === 'completed'
              ? `Completed ${stage.name}`
              : stage.status === 'completed'
                ? `Reopened ${stage.name}`
                : `Moved to ${stage.name}`,
            actorId: BigInt(actorId),
            actorName: actor?.fullName ?? 'Lab team',
          },
        });
      }
    });
    return this.getByNumber(caseNumber);
  }
}
