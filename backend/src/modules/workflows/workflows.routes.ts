import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../../infrastructure/http/validate.ts';
import {
  createAuthenticationMiddleware,
  createPermissionMiddleware,
} from '../auth/auth.controllers.ts';
import type { AuthServiceContract } from '../auth/auth.domain.ts';
import { createWorkflowsControllers } from './workflows.controllers.ts';
import type { WorkflowsServiceContract } from './workflows.domain.ts';
import {
  createWorkflowSchema,
  createWorkflowStageSchema,
  listWorkflowsQuerySchema,
  reorderWorkflowStagesSchema,
  updateWorkflowSchema,
  updateWorkflowStageSchema,
  workflowIdParamsSchema,
  workflowStageParamsSchema,
} from './workflows.schema.ts';

export function createWorkflowsRoutes(
  auth: AuthServiceContract,
  service: WorkflowsServiceContract,
): Router {
  const router = Router();
  const controllers = createWorkflowsControllers(service);
  router.use(createAuthenticationMiddleware(auth));

  router.get(
    '/',
    createPermissionMiddleware('workflows:view'),
    validateQuery(listWorkflowsQuerySchema),
    controllers.list,
  );
  router.post(
    '/',
    createPermissionMiddleware('workflows:create'),
    validateBody(createWorkflowSchema),
    controllers.create,
  );
  router.get(
    '/:workflowId',
    createPermissionMiddleware('workflows:view'),
    validateParams(workflowIdParamsSchema),
    controllers.getById,
  );
  router.patch(
    '/:workflowId',
    createPermissionMiddleware('workflows:update'),
    validateParams(workflowIdParamsSchema),
    validateBody(updateWorkflowSchema),
    controllers.update,
  );
  router.delete(
    '/:workflowId',
    createPermissionMiddleware('workflows:delete'),
    validateParams(workflowIdParamsSchema),
    controllers.delete,
  );
  router.put(
    '/:workflowId/stages/order',
    createPermissionMiddleware('workflow_steps:reorder'),
    validateParams(workflowIdParamsSchema),
    validateBody(reorderWorkflowStagesSchema),
    controllers.reorderStages,
  );
  router.post(
    '/:workflowId/stages',
    createPermissionMiddleware('workflow_steps:create'),
    validateParams(workflowIdParamsSchema),
    validateBody(createWorkflowStageSchema),
    controllers.createStage,
  );
  router.patch(
    '/:workflowId/stages/:stageId',
    createPermissionMiddleware('workflow_steps:update'),
    validateParams(workflowStageParamsSchema),
    validateBody(updateWorkflowStageSchema),
    controllers.updateStage,
  );
  router.delete(
    '/:workflowId/stages/:stageId',
    createPermissionMiddleware('workflow_steps:delete'),
    validateParams(workflowStageParamsSchema),
    controllers.deleteStage,
  );
  return router;
}
