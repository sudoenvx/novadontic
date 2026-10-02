import type { RequestHandler } from 'express';
import type {
  WorkflowStageInput,
  WorkflowStageUpdateInput,
  WorkflowTemplateInput,
  WorkflowTemplateUpdateInput,
  WorkflowsServiceContract,
} from './workflows.domain.ts';
import {
  listWorkflowsQuerySchema,
  reorderWorkflowStagesSchema,
  workflowIdParamsSchema,
  workflowStageParamsSchema,
} from './workflows.schema.ts';

type WorkflowsControllers = {
  list: RequestHandler;
  getById: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
  createStage: RequestHandler;
  updateStage: RequestHandler;
  deleteStage: RequestHandler;
  reorderStages: RequestHandler;
};

export function createWorkflowsControllers(
  service: WorkflowsServiceContract,
): WorkflowsControllers {
  const list: RequestHandler = async (request, response) => {
    response.status(200).json({
      data: await service.list(listWorkflowsQuerySchema.parse(request.query)),
    });
  };

  const getById: RequestHandler = async (request, response) => {
    const { workflowId } = workflowIdParamsSchema.parse(request.params);
    response.status(200).json({ data: await service.getById(workflowId) });
  };

  const create: RequestHandler = async (request, response) => {
    response.status(201).json({
      data: await service.create(request.body as WorkflowTemplateInput),
    });
  };

  const update: RequestHandler = async (request, response) => {
    const { workflowId } = workflowIdParamsSchema.parse(request.params);
    response.status(200).json({
      data: await service.update(workflowId, request.body as WorkflowTemplateUpdateInput),
    });
  };

  const deleteWorkflow: RequestHandler = async (request, response) => {
    const { workflowId } = workflowIdParamsSchema.parse(request.params);
    await service.delete(workflowId);
    response.status(204).end();
  };

  const createStage: RequestHandler = async (request, response) => {
    const { workflowId } = workflowIdParamsSchema.parse(request.params);
    response.status(201).json({
      data: await service.createStage(workflowId, request.body as WorkflowStageInput),
    });
  };

  const updateStage: RequestHandler = async (request, response) => {
    const { workflowId, stageId } = workflowStageParamsSchema.parse(request.params);
    response.status(200).json({
      data: await service.updateStage(
        workflowId,
        stageId,
        request.body as WorkflowStageUpdateInput,
      ),
    });
  };

  const deleteStage: RequestHandler = async (request, response) => {
    const { workflowId, stageId } = workflowStageParamsSchema.parse(request.params);
    await service.deleteStage(workflowId, stageId);
    response.status(204).end();
  };

  const reorderStages: RequestHandler = async (request, response) => {
    const { workflowId } = workflowIdParamsSchema.parse(request.params);
    const { stageIds } = reorderWorkflowStagesSchema.parse(request.body);
    response.status(200).json({
      data: await service.reorderStages(workflowId, stageIds),
    });
  };

  return {
    list,
    getById,
    create,
    update,
    delete: deleteWorkflow,
    createStage,
    updateStage,
    deleteStage,
    reorderStages,
  };
}
