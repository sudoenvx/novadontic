import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../../infrastructure/http/validate.ts';
import {
  createAuthenticationMiddleware,
  createPermissionMiddleware,
} from '../auth/auth.controllers.ts';
import type { AuthServiceContract } from '../auth/auth.domain.ts';
import { createSettingsControllers } from './settings.controllers.ts';
import type { SettingsServiceContract } from './settings.domain.ts';
import {
  listSettingsQuerySchema,
  saveSettingSchema,
  settingKeyParamsSchema,
} from './settings.schema.ts';

export function createSettingsRoutes(
  auth: AuthServiceContract,
  service: SettingsServiceContract,
): Router {
  const router = Router();
  const controllers = createSettingsControllers(service);

  router.use(createAuthenticationMiddleware(auth));
  router.get(
    '/',
    createPermissionMiddleware('lab_settings:view'),
    validateQuery(listSettingsQuerySchema),
    controllers.list,
  );
  router.get(
    '/:key',
    createPermissionMiddleware('lab_settings:view'),
    validateParams(settingKeyParamsSchema),
    controllers.getByKey,
  );
  router.put(
    '/:key',
    createPermissionMiddleware('lab_settings:update'),
    validateParams(settingKeyParamsSchema),
    validateBody(saveSettingSchema),
    controllers.save,
  );
  router.delete(
    '/:key',
    createPermissionMiddleware('lab_settings:update'),
    validateParams(settingKeyParamsSchema),
    controllers.delete,
  );

  return router;
}
