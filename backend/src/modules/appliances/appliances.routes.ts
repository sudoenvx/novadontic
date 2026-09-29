import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../../infrastructure/http/validate.ts';
import {
  createAuthenticationMiddleware,
  createPermissionMiddleware,
} from '../auth/auth.controllers.ts';
import type { AuthServiceContract } from '../auth/auth.domain.ts';
import { createAppliancesControllers } from './appliances.controllers.ts';
import type { AppliancesServiceContract } from './appliances.domain.ts';
import {
  applianceFieldParamsSchema,
  applianceGroupParamsSchema,
  applianceTypeIdParamsSchema,
  createApplianceFieldGroupSchema,
  createApplianceFieldSchema,
  createApplianceTypeSchema,
  listApplianceTypesQuerySchema,
  setApplianceTypeActiveSchema,
  updateApplianceFieldGroupSchema,
  updateApplianceFieldSchema,
  updateApplianceTypeSchema,
} from './appliances.schema.ts';

export function createAppliancesRoutes(
  auth: AuthServiceContract,
  service: AppliancesServiceContract,
): Router {
  const router = Router();
  const controllers = createAppliancesControllers(service);
  router.use(createAuthenticationMiddleware(auth));

  router.get(
    '/',
    createPermissionMiddleware('appliances:view'),
    validateQuery(listApplianceTypesQuerySchema),
    controllers.listTypes,
  );
  router.post(
    '/',
    createPermissionMiddleware('appliances:create'),
    validateBody(createApplianceTypeSchema),
    controllers.createType,
  );
  router.get(
    '/:applianceTypeId',
    createPermissionMiddleware('appliances:view'),
    validateParams(applianceTypeIdParamsSchema),
    controllers.getType,
  );
  router.patch(
    '/:applianceTypeId',
    createPermissionMiddleware('appliances:update'),
    validateParams(applianceTypeIdParamsSchema),
    validateBody(updateApplianceTypeSchema),
    controllers.updateType,
  );
  router.patch(
    '/:applianceTypeId/activation',
    createPermissionMiddleware('appliances:activate'),
    validateParams(applianceTypeIdParamsSchema),
    validateBody(setApplianceTypeActiveSchema),
    controllers.setTypeActive,
  );
  router.delete(
    '/:applianceTypeId',
    createPermissionMiddleware('appliances:delete'),
    validateParams(applianceTypeIdParamsSchema),
    controllers.deleteType,
  );

  router.post(
    '/:applianceTypeId/field-groups',
    createPermissionMiddleware('appliance_fields:create'),
    validateParams(applianceTypeIdParamsSchema),
    validateBody(createApplianceFieldGroupSchema),
    controllers.createGroup,
  );
  router.patch(
    '/:applianceTypeId/field-groups/:groupId',
    createPermissionMiddleware('appliance_fields:update'),
    validateParams(applianceGroupParamsSchema),
    validateBody(updateApplianceFieldGroupSchema),
    controllers.updateGroup,
  );
  router.delete(
    '/:applianceTypeId/field-groups/:groupId',
    createPermissionMiddleware('appliance_fields:delete'),
    validateParams(applianceGroupParamsSchema),
    controllers.deleteGroup,
  );
  router.post(
    '/:applianceTypeId/field-groups/:groupId/fields',
    createPermissionMiddleware('appliance_fields:create'),
    validateParams(applianceGroupParamsSchema),
    validateBody(createApplianceFieldSchema),
    controllers.createField,
  );
  router.patch(
    '/:applianceTypeId/field-groups/:groupId/fields/:fieldId',
    createPermissionMiddleware('appliance_fields:update'),
    validateParams(applianceFieldParamsSchema),
    validateBody(updateApplianceFieldSchema),
    controllers.updateField,
  );
  router.delete(
    '/:applianceTypeId/field-groups/:groupId/fields/:fieldId',
    createPermissionMiddleware('appliance_fields:delete'),
    validateParams(applianceFieldParamsSchema),
    controllers.deleteField,
  );

  router.get(
    '/:applianceTypeId/field-groups',
    createPermissionMiddleware('appliance_fields:view'),
    validateParams(applianceTypeIdParamsSchema),
    controllers.getGroups,
  );
  return router;
}
