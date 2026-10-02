import { access } from 'node:fs/promises';
import type { Prisma, PrismaClient } from '../../generated/prisma/client.ts';
import { logger } from '../../config/logger.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import type {
  CaseActivityActor,
  CaseFile,
  CaseFileKind,
  CaseFileUpload,
  CaseAssetsServiceContract,
  CaseTimelineEntry,
  StoredCaseFile,
} from './case-assets.domain.ts';
import { getCaseFileKind, getCaseFileMimeType, safeOriginalFileName, CaseFileStorage } from './case-file-storage.ts';

type CaseFileRow = Prisma.CaseFileGetPayload<{
  include: {
    stage: { select: { name: true } };
    case: { select: { caseNumber: true } };
  };
}>;
type TimelineEntryRow = Prisma.CaseTimelineEntryGetPayload<object>;
const fileKinds: readonly CaseFileKind[] = ['model', 'image', 'document'];

function invalidStoredValue(resource: string): Error {
  return new Error(`Stored ${resource} has an unsupported value.`);
}

function caseNotFound(): AppError {
  return new AppError('Case was not found', 404, 'CASE_NOT_FOUND');
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

function caseFileNotFound(): AppError {
  return new AppError('Case file was not found', 404, 'CASE_FILE_NOT_FOUND');
}

function toCaseFile(row: CaseFileRow): CaseFile {
  if (!row.case.caseNumber) {
    throw new Error('Persisted case file is attached to a case without a case number.');
  }
  if (!fileKinds.includes(row.kind as CaseFileKind)) {
    throw invalidStoredValue('case file kind');
  }
  const sizeBytes = Number(row.sizeBytes);
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 0) {
    throw invalidStoredValue('case file size');
  }
  return {
    id: row.id.toString(),
    caseNumber: row.case.caseNumber,
    stageId: row.stageId?.toString() ?? null,
    stageName: row.stage?.name ?? null,
    name: row.originalName,
    mimeType: row.mimeType,
    kind: row.kind as CaseFileKind,
    sizeBytes,
    uploadedBy: row.uploadedByName,
    createdAt: row.createdAt,
  };
}

function toTimelineEntry(row: TimelineEntryRow): CaseTimelineEntry {
  if (row.kind !== 'event' && row.kind !== 'comment') {
    throw invalidStoredValue('case timeline entry kind');
  }
  return {
    id: row.id.toString(),
    kind: row.kind,
    eventType: row.eventType,
    message: row.message,
    author: row.actorName,
    createdAt: row.createdAt,
  };
}

function workflowFileKind(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (getCaseFileKind(fileName) === 'model') return 'stl';
  if (getCaseFileKind(fileName) === 'image') return 'photo';
  if (extension === 'pdf') return 'pdf';
  return 'doc';
}

function parseAllowedFileKinds(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value) || !value.every((kind) => typeof kind === 'string')) {
    throw invalidStoredValue('case stage allowed file kinds');
  }
  return value;
}

export class CaseAssetsService implements CaseAssetsServiceContract {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: CaseFileStorage,
  ) {}

  async listFiles(caseNumber: string, kind?: CaseFileKind): Promise<CaseFile[]> {
    const caseRecord = await this.prisma.caseRecord.findUnique({
      where: { caseNumber },
      select: { id: true },
    });
    if (!caseRecord) throw caseNotFound();

    const rows = await this.prisma.caseFile.findMany({
      where: {
        caseId: caseRecord.id,
        ...(kind ? { kind } : {}),
      },
      include: { stage: { select: { name: true } }, case: { select: { caseNumber: true } } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return rows.map(toCaseFile);
  }

  async uploadFile(
    caseNumber: string,
    stageId: string | null,
    upload: CaseFileUpload,
    actor: CaseActivityActor,
  ): Promise<CaseFile> {
    try {
      if (!upload.sizeBytes) {
        throw new AppError('The uploaded file is empty.', 422, 'EMPTY_CASE_FILE');
      }
      const originalName = safeOriginalFileName(upload.originalName);
      const kind = getCaseFileKind(originalName);
      if (!originalName || !kind || kind !== upload.kind) {
        throw new AppError('This file type is not supported.', 422, 'UNSUPPORTED_CASE_FILE_TYPE');
      }
      const mimeType = getCaseFileMimeType(originalName);
      if (!/^[0-9a-f-]{36}$/i.test(upload.storageKey)) {
        throw new Error('Uploaded case file has an invalid storage key.');
      }

      const file = await this.prisma.$transaction(async (transaction) => {
        const caseRecord = await transaction.caseRecord.findUnique({
          where: { caseNumber },
          select: { id: true },
        });
        if (!caseRecord) throw caseNotFound();

        if (stageId) {
          const stage = await transaction.caseStage.findFirst({
            where: { id: BigInt(stageId), caseId: caseRecord.id },
            select: { id: true, allowedFileKinds: true },
          });
          if (!stage) {
            throw new AppError('Case production stage was not found.', 404, 'CASE_STAGE_NOT_FOUND');
          }
          if (!parseAllowedFileKinds(stage.allowedFileKinds).includes(workflowFileKind(originalName))) {
            throw new AppError(
              'This file type is not allowed for the selected production stage.',
              422,
              'CASE_STAGE_FILE_TYPE_NOT_ALLOWED',
            );
          }
        }

        const row = await transaction.caseFile.create({
          data: {
            caseId: caseRecord.id,
            stageId: stageId ? BigInt(stageId) : null,
            storageKey: upload.storageKey,
            originalName,
            mimeType,
            kind,
            sizeBytes: BigInt(upload.sizeBytes),
            uploadedById: BigInt(actor.id),
            uploadedByName: actor.fullName,
          },
          include: { stage: { select: { name: true } }, case: { select: { caseNumber: true } } },
        });
        await transaction.caseTimelineEntry.create({
          data: {
            caseId: caseRecord.id,
            kind: 'event',
            eventType: 'case_file_uploaded',
            message: `Uploaded ${originalName}`,
            actorId: BigInt(actor.id),
            actorName: actor.fullName,
          },
        });
        return toCaseFile(row);
      });
      return file;
    } catch (error) {
      await this.removeUploadedFileAfterFailure(upload.storageKey);
      throw error;
    }
  }

  async getFile(caseNumber: string, fileId: string): Promise<StoredCaseFile> {
    const row = await this.prisma.caseFile.findFirst({
      where: { id: BigInt(fileId), case: { caseNumber } },
      include: { stage: { select: { name: true } }, case: { select: { caseNumber: true } } },
    });
    if (!row) throw caseFileNotFound();

    const file = toCaseFile(row);
    const storagePath = this.storage.pathForKey(row.storageKey);
    try {
      await access(storagePath);
    } catch (error) {
      if (isMissingFile(error)) {
        throw new AppError('The stored file data is unavailable.', 404, 'CASE_FILE_DATA_NOT_FOUND');
      }
      throw error;
    }
    return { ...file, storagePath };
  }

  async renameFile(
    caseNumber: string,
    fileId: string,
    name: string,
    actor: CaseActivityActor,
  ): Promise<CaseFile> {
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.caseFile.findFirst({
        where: { id: BigInt(fileId), case: { caseNumber } },
        include: { stage: { select: { name: true } }, case: { select: { id: true, caseNumber: true } } },
      });
      if (!existing) throw caseFileNotFound();
      if (getCaseFileKind(name) !== existing.kind) {
        throw new AppError('The file extension must remain consistent with its file type.', 422, 'INVALID_CASE_FILE_NAME');
      }
      const updated = await transaction.caseFile.update({
        where: { id: existing.id },
        data: { originalName: name },
        include: { stage: { select: { name: true } }, case: { select: { caseNumber: true } } },
      });
      await transaction.caseTimelineEntry.create({
        data: {
          caseId: existing.case.id,
          kind: 'event',
          eventType: 'case_file_renamed',
          message: `Renamed ${existing.originalName} to ${name}`,
          actorId: BigInt(actor.id),
          actorName: actor.fullName,
        },
      });
      return toCaseFile(updated);
    });
  }

  async deleteFile(
    caseNumber: string,
    fileId: string,
    actor: CaseActivityActor,
  ): Promise<void> {
    const deleted = await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.caseFile.findFirst({
        where: { id: BigInt(fileId), case: { caseNumber } },
        select: { id: true, caseId: true, storageKey: true, originalName: true },
      });
      if (!existing) throw caseFileNotFound();
      await transaction.caseFile.delete({ where: { id: existing.id } });
      await transaction.caseTimelineEntry.create({
        data: {
          caseId: existing.caseId,
          kind: 'event',
          eventType: 'case_file_deleted',
          message: `Removed ${existing.originalName}`,
          actorId: BigInt(actor.id),
          actorName: actor.fullName,
        },
      });
      return existing;
    });

    try {
      await this.storage.remove(deleted.storageKey);
    } catch (error) {
      if (isMissingFile(error)) return;
      logger.error('Case file metadata was deleted but stored data cleanup failed', {
        caseNumber,
        fileId,
        error,
      });
      throw new AppError(
        'The file was removed from the case, but its stored data could not be cleaned up.',
        500,
        'CASE_FILE_CLEANUP_FAILED',
      );
    }
  }

  async listActivity(caseNumber: string): Promise<CaseTimelineEntry[]> {
    const caseRecord = await this.prisma.caseRecord.findUnique({
      where: { caseNumber },
      select: { id: true },
    });
    if (!caseRecord) throw caseNotFound();
    const rows = await this.prisma.caseTimelineEntry.findMany({
      where: { caseId: caseRecord.id },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    return rows.map(toTimelineEntry);
  }

  async addComment(
    caseNumber: string,
    message: string,
    actor: CaseActivityActor,
  ): Promise<CaseTimelineEntry> {
    const row = await this.prisma.$transaction(async (transaction) => {
      const caseRecord = await transaction.caseRecord.findUnique({
        where: { caseNumber },
        select: { id: true },
      });
      if (!caseRecord) throw caseNotFound();
      return transaction.caseTimelineEntry.create({
        data: {
          caseId: caseRecord.id,
          kind: 'comment',
          message,
          actorId: BigInt(actor.id),
          actorName: actor.fullName,
        },
      });
    });
    return toTimelineEntry(row);
  }

  private async removeUploadedFileAfterFailure(storageKey: string): Promise<void> {
    try {
      await this.storage.remove(storageKey);
    } catch (error) {
      if (!isMissingFile(error)) {
        logger.error('Failed to clean up an unregistered case file upload', { storageKey, error });
      }
    }
  }
}
