import { mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer, { MulterError } from 'multer';
import type { RequestHandler } from 'express';

import { AppError } from '../../shared/errors/app-error.ts';

export const maxCaseFileSizeBytes = 250 * 1024 * 1024;

const fileKindByExtension = new Map<string, 'model' | 'image' | 'document'>([
  ['.stl', 'model'],
  ['.obj', 'model'],
  ['.ply', 'model'],
  ['.3mf', 'model'],
  ['.png', 'image'],
  ['.jpg', 'image'],
  ['.jpeg', 'image'],
  ['.webp', 'image'],
  ['.gif', 'image'],
  ['.bmp', 'image'],
  ['.tif', 'image'],
  ['.tiff', 'image'],
  ['.pdf', 'document'],
  ['.doc', 'document'],
  ['.docx', 'document'],
  ['.txt', 'document'],
  ['.rtf', 'document'],
  ['.xls', 'document'],
  ['.xlsx', 'document'],
  ['.csv', 'document'],
]);

const mimeTypeByExtension = new Map<string, string>([
  ['.stl', 'model/stl'],
  ['.obj', 'model/obj'],
  ['.ply', 'model/ply'],
  ['.3mf', 'model/3mf'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.bmp', 'image/bmp'],
  ['.tif', 'image/tiff'],
  ['.tiff', 'image/tiff'],
  ['.pdf', 'application/pdf'],
  ['.doc', 'application/msword'],
  ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['.txt', 'text/plain'],
  ['.rtf', 'application/rtf'],
  ['.xls', 'application/vnd.ms-excel'],
  ['.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ['.csv', 'text/csv'],
]);

export function getCaseFileKind(fileName: string) {
  return fileKindByExtension.get(path.extname(fileName).toLowerCase());
}

export function getCaseFileMimeType(fileName: string) {
  return mimeTypeByExtension.get(path.extname(fileName).toLowerCase())
    ?? 'application/octet-stream';
}

export class CaseFileStorage {
  constructor(readonly directory: string) {}

  pathForKey(storageKey: string) {
    if (!/^[0-9a-f-]{36}$/i.test(storageKey)) {
      throw new Error('Stored case file has an invalid storage key.');
    }
    return path.join(this.directory, storageKey);
  }

  async remove(storageKey: string): Promise<void> {
    await unlink(this.pathForKey(storageKey));
  }
}

export function createCaseFileUploadMiddleware(
  storage: CaseFileStorage,
): RequestHandler {
  const upload = multer({
    storage: multer.diskStorage({
      destination: (_request, _file, callback) => {
        void mkdir(storage.directory, { recursive: true }).then(
          () => callback(null, storage.directory),
          (error: unknown) => callback(
            error instanceof Error ? error : new Error('Could not create case file storage directory.'),
            storage.directory,
          ),
        );
      },
      filename: (_request, _file, callback) => callback(null, randomUUID()),
    }),
    limits: { fileSize: maxCaseFileSizeBytes, files: 1 },
    fileFilter: (_request, file, callback) => {
      if (!getCaseFileKind(file.originalname)) {
        callback(new AppError('This file type is not supported.', 422, 'UNSUPPORTED_CASE_FILE_TYPE'));
        return;
      }
      callback(null, true);
    },
  }).single('file');

  return (request, response, next) => {
    upload(request, response, (error: unknown) => {
      if (!error) {
        next();
        return;
      }

      if (error instanceof MulterError) {
        next(new AppError(
          error.code === 'LIMIT_FILE_SIZE'
            ? 'Case files cannot exceed 250 MB.'
            : 'The uploaded file could not be accepted.',
          error.code === 'LIMIT_FILE_SIZE' ? 413 : 422,
          error.code === 'LIMIT_FILE_SIZE' ? 'CASE_FILE_TOO_LARGE' : 'INVALID_CASE_FILE_UPLOAD',
        ));
        return;
      }

      next(error);
    });
  };
}

export function safeOriginalFileName(fileName: string) {
  return path.basename(fileName.replace(/\\/g, '/')).replace(/[\u0000-\u001f]/g, '').trim();
}
