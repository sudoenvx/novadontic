import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../../infrastructure/http/validate.ts';
import {
  createAuthenticationMiddleware,
  createPermissionMiddleware,
} from '../auth/auth.controllers.ts';
import type { AuthServiceContract } from '../auth/auth.domain.ts';
import { createStaffControllers } from './staff.controllers.ts';
import type { StaffServiceContract } from './staff.domain.ts';
import {
  createStaffSchema,
  listStaffQuerySchema,
  setStaffActiveSchema,
  staffIdParamsSchema,
  updateStaffSchema,
} from './staff.schema.ts';

export function createStaffRoutes(
  auth: AuthServiceContract,
  service: StaffServiceContract,
): Router {
  const router = Router();
  const controllers = createStaffControllers(service);
  router.use(createAuthenticationMiddleware(auth));

  router.get(
    '/',
    createPermissionMiddleware('staff:view'),
    validateQuery(listStaffQuerySchema),
    controllers.list,
  );
  router.post(
    '/',
    createPermissionMiddleware('staff:create'),
    validateBody(createStaffSchema),
    controllers.create,
  );
  router.get(
    '/:staffId',
    createPermissionMiddleware('staff:view'),
    validateParams(staffIdParamsSchema),
    controllers.getById,
  );
  router.patch(
    '/:staffId',
    createPermissionMiddleware('staff:update'),
    validateParams(staffIdParamsSchema),
    validateBody(updateStaffSchema),
    controllers.update,
  );
  router.patch(
    '/:staffId/status',
    createPermissionMiddleware('staff:suspend'),
    validateParams(staffIdParamsSchema),
    validateBody(setStaffActiveSchema),
    controllers.setActive,
  );
  router.delete(
    '/:staffId',
    createPermissionMiddleware('staff:delete'),
    validateParams(staffIdParamsSchema),
    controllers.delete,
  );
  return router;
}
