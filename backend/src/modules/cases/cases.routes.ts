import { Router } from 'express';
import type { RequestHandler } from 'express';
import { logger } from '../../config/logger.ts';
import { validateBody, validateParams, validateQuery } from '../../infrastructure/http/validate.ts';
import {
  createAuthenticationMiddleware,
  createPermissionMiddleware,
} from '../auth/auth.controllers.ts';
import type { AuthServiceContract } from '../auth/auth.domain.ts';
import { createCasesControllers } from './cases.controllers.ts';
import type { CaseAssetsServiceContract } from './case-assets.domain.ts';
import type { CasesServiceContract } from './cases.domain.ts';
import { CaseFileStorage, createCaseFileUploadMiddleware } from './case-file-storage.ts';
import {
  caseFileParamsSchema,
  caseNumberParamsSchema,
  caseStageParamsSchema,
  createCaseSchema,
  createCaseCommentSchema,
  listCaseFilesQuerySchema,
  listCasesQuerySchema,
  renameCaseFileSchema,
  uploadCaseFileSchema,
  updateCaseSchema,
  updateCaseStageStatusSchema,
} from './cases.schema.ts';

export function createCasesRoutes(
  auth: AuthServiceContract,
  service: CasesServiceContract,
  assets: CaseAssetsServiceContract,
  fileStorage: CaseFileStorage,
): Router {
  const router = Router();
  const controllers = createCasesControllers(service, assets);
  const uploadCaseFile = createCaseFileUploadMiddleware(fileStorage);
  const validateUploadBody: RequestHandler = (request, response, next) => {
    validateBody(uploadCaseFileSchema)(request, response, (validationError?: unknown) => {
      if (!validationError) {
        next();
        return;
      }
      const storageKey = request.file?.filename;
      if (!storageKey) {
        next(validationError);
        return;
      }
      void fileStorage.remove(storageKey).then(
        () => next(validationError),
        (cleanupError: unknown) => {
          logger.error('Failed to clean up an invalid case file request', { storageKey, cleanupError });
          next(validationError);
        },
      );
    });
  };
  router.use(createAuthenticationMiddleware(auth));

  router.get(
    '/',
    createPermissionMiddleware('cases:view'),
    validateQuery(listCasesQuerySchema),
    controllers.list,
  );
  router.post(
    '/',
    createPermissionMiddleware('cases:create'),
    validateBody(createCaseSchema),
    controllers.create,
  );
  router.get(
    '/:caseNumber',
    createPermissionMiddleware('cases:view'),
    validateParams(caseNumberParamsSchema),
    controllers.getByNumber,
  );
  router.patch(
    '/:caseNumber',
    createPermissionMiddleware('cases:update'),
    validateParams(caseNumberParamsSchema),
    validateBody(updateCaseSchema),
    controllers.update,
  );
  router.patch(
    '/:caseNumber/stages/:stageId/status',
    createPermissionMiddleware('cases:move'),
    validateParams(caseStageParamsSchema),
    validateBody(updateCaseStageStatusSchema),
    controllers.updateStageStatus,
  );
  router.get(
    '/:caseNumber/files',
    createPermissionMiddleware('case_files:view'),
    validateParams(caseNumberParamsSchema),
    validateQuery(listCaseFilesQuerySchema),
    controllers.listFiles,
  );
  router.post(
    '/:caseNumber/files',
    createPermissionMiddleware('case_files:upload'),
    validateParams(caseNumberParamsSchema),
    uploadCaseFile,
    validateUploadBody,
    controllers.uploadFile,
  );
  router.get(
    '/:caseNumber/files/:fileId/download',
    createPermissionMiddleware('case_files:download'),
    validateParams(caseFileParamsSchema),
    controllers.downloadFile,
  );
  router.patch(
    '/:caseNumber/files/:fileId',
    createPermissionMiddleware('case_files:update'),
    validateParams(caseFileParamsSchema),
    validateBody(renameCaseFileSchema),
    controllers.renameFile,
  );
  router.delete(
    '/:caseNumber/files/:fileId',
    createPermissionMiddleware('case_files:delete'),
    validateParams(caseFileParamsSchema),
    controllers.deleteFile,
  );
  router.get(
    '/:caseNumber/activity',
    createPermissionMiddleware('case_activity:view'),
    validateParams(caseNumberParamsSchema),
    controllers.listActivity,
  );
  router.post(
    '/:caseNumber/activity',
    createPermissionMiddleware('case_activity:add_note'),
    validateParams(caseNumberParamsSchema),
    validateBody(createCaseCommentSchema),
    controllers.addComment,
  );
  return router;
}
