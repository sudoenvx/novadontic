import type { RequestHandler } from 'express';
import type {
  CasesServiceContract,
  CreateCaseInput,
  UpdateCaseInput,
} from './cases.domain.ts';
import type { AuthenticatedStaffUser } from '../auth/auth.domain.ts';
import type { CaseAssetsServiceContract } from './case-assets.domain.ts';
import {
  caseFileParamsSchema,
  caseNumberParamsSchema,
  caseStageParamsSchema,
  createCaseCommentSchema,
  listCaseFilesQuerySchema,
  listCasesQuerySchema,
  renameCaseFileSchema,
  uploadCaseFileSchema,
  updateCaseStageStatusSchema,
} from './cases.schema.ts';

type CasesControllers = {
  list: RequestHandler;
  getByNumber: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  updateStageStatus: RequestHandler;
  listFiles: RequestHandler;
  uploadFile: RequestHandler;
  downloadFile: RequestHandler;
  renameFile: RequestHandler;
  deleteFile: RequestHandler;
  listActivity: RequestHandler;
  addComment: RequestHandler;
};

function authenticatedActor(response: Parameters<RequestHandler>[1]) {
  const staffUser = response.locals['staffUser'] as AuthenticatedStaffUser | undefined;
  if (!staffUser) throw new Error('Authenticated staff user is missing from the request.');
  return { id: staffUser.id, fullName: staffUser.fullName };
}

export function createCasesControllers(
  service: CasesServiceContract,
  assets: CaseAssetsServiceContract,
): CasesControllers {
  const list: RequestHandler = async (request, response) => {
    response.status(200).json({
      data: await service.list(listCasesQuerySchema.parse(request.query)),
    });
  };

  const getByNumber: RequestHandler = async (request, response) => {
    const { caseNumber } = caseNumberParamsSchema.parse(request.params);
    response.status(200).json({ data: await service.getByNumber(caseNumber) });
  };

  const create: RequestHandler = async (request, response) => {
    const staffUser = response.locals['staffUser'] as AuthenticatedStaffUser | undefined;
    if (!staffUser) throw new Error('Authenticated staff user is missing from the request.');
    response.status(201).json({
      data: await service.create(request.body as CreateCaseInput, staffUser.id),
    });
  };

  const update: RequestHandler = async (request, response) => {
    const { caseNumber } = caseNumberParamsSchema.parse(request.params);
    response.status(200).json({
      data: await service.update(caseNumber, request.body as UpdateCaseInput),
    });
  };

  const updateStageStatus: RequestHandler = async (request, response) => {
    const { caseNumber, stageId } = caseStageParamsSchema.parse(request.params);
    const { status } = updateCaseStageStatusSchema.parse(request.body);
    response.status(200).json({
      data: await service.updateStageStatus(caseNumber, stageId, status, authenticatedActor(response).id),
    });
  };

  const listFiles: RequestHandler = async (request, response) => {
    const { caseNumber } = caseNumberParamsSchema.parse(request.params);
    const { kind } = listCaseFilesQuerySchema.parse(request.query);
    response.status(200).json({ data: await assets.listFiles(caseNumber, kind) });
  };

  const uploadFile: RequestHandler = async (request, response) => {
    const { caseNumber } = caseNumberParamsSchema.parse(request.params);
    const { stageId } = uploadCaseFileSchema.parse(request.body);
    const file = request.file;
    if (!file) throw new Error('File upload middleware did not provide an uploaded file.');
    response.status(201).json({
      data: await assets.uploadFile(
        caseNumber,
        stageId ?? null,
        {
          storageKey: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          kind: file.originalname.toLowerCase().match(/\.(stl|obj|ply|3mf)$/)
            ? 'model'
            : file.originalname.toLowerCase().match(/\.(png|jpe?g|webp|gif|bmp|tiff?)$/)
              ? 'image'
              : 'document',
          sizeBytes: file.size,
        },
        authenticatedActor(response),
      ),
    });
  };

  const downloadFile: RequestHandler = async (request, response, next) => {
    const { caseNumber, fileId } = caseFileParamsSchema.parse(request.params);
    const file = await assets.getFile(caseNumber, fileId);
    response.setHeader('Cache-Control', 'private, no-store');
    response.download(file.storagePath, file.name, (error) => {
      if (error) next(error);
    });
  };

  const renameFile: RequestHandler = async (request, response) => {
    const { caseNumber, fileId } = caseFileParamsSchema.parse(request.params);
    const { name } = renameCaseFileSchema.parse(request.body);
    response.status(200).json({
      data: await assets.renameFile(caseNumber, fileId, name, authenticatedActor(response)),
    });
  };

  const deleteFile: RequestHandler = async (request, response) => {
    const { caseNumber, fileId } = caseFileParamsSchema.parse(request.params);
    await assets.deleteFile(caseNumber, fileId, authenticatedActor(response));
    response.status(204).end();
  };

  const listActivity: RequestHandler = async (request, response) => {
    const { caseNumber } = caseNumberParamsSchema.parse(request.params);
    response.status(200).json({ data: await assets.listActivity(caseNumber) });
  };

  const addComment: RequestHandler = async (request, response) => {
    const { caseNumber } = caseNumberParamsSchema.parse(request.params);
    const { message } = createCaseCommentSchema.parse(request.body);
    response.status(201).json({
      data: await assets.addComment(caseNumber, message, authenticatedActor(response)),
    });
  };

  return {
    list,
    getByNumber,
    create,
    update,
    updateStageStatus,
    listFiles,
    uploadFile,
    downloadFile,
    renameFile,
    deleteFile,
    listActivity,
    addComment,
  };
}
