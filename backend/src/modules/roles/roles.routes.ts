import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../../infrastructure/http/validate.ts';
import {
  createAuthenticationMiddleware,
  createPermissionMiddleware,
} from '../auth/auth.controllers.ts';
import type { AuthServiceContract } from '../auth/auth.domain.ts';
import { createRolesControllers } from './roles.controllers.ts';
import type { RolesServiceContract } from './roles.domain.ts';
import {
  createRoleSchema,
  listPermissionsQuerySchema,
  listRolesQuerySchema,
  roleIdParamsSchema,
  setRolePermissionsSchema,
  updateRoleSchema,
} from './roles.schema.ts';

export function createRolesRoutes(
  auth: AuthServiceContract,
  service: RolesServiceContract,
): Router {
  const router = Router();
  const controllers = createRolesControllers(service);

  router.use(createAuthenticationMiddleware(auth));
  router.get(
    '/permissions',
    createPermissionMiddleware('roles:view'),
    validateQuery(listPermissionsQuerySchema),
    controllers.listPermissions,
  );
  router.get(
    '/',
    createPermissionMiddleware('roles:view'),
    validateQuery(listRolesQuerySchema),
    controllers.list,
  );
  router.post(
    '/',
    createPermissionMiddleware('roles:create'),
    validateBody(createRoleSchema),
    controllers.create,
  );
  router.get(
    '/:roleId',
    createPermissionMiddleware('roles:view'),
    validateParams(roleIdParamsSchema),
    controllers.getById,
  );
  router.patch(
    '/:roleId',
    createPermissionMiddleware('roles:update'),
    validateParams(roleIdParamsSchema),
    validateBody(updateRoleSchema),
    controllers.update,
  );
  router.put(
    '/:roleId/permissions',
    createPermissionMiddleware('roles:manage_permissions'),
    validateParams(roleIdParamsSchema),
    validateBody(setRolePermissionsSchema),
    controllers.setPermissions,
  );
  router.delete(
    '/:roleId',
    createPermissionMiddleware('roles:delete'),
    validateParams(roleIdParamsSchema),
    controllers.delete,
  );
  return router;
}
