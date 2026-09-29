import { Router } from 'express';
import { validateBody, validateParams } from '../../infrastructure/http/validate.ts';
import type { AuthServiceContract } from '../auth/auth.domain.ts';
import {
  createAuthenticationMiddleware,
  createPermissionMiddleware,
} from '../auth/auth.controllers.ts';
import { createClinicsControllers } from './clinics.controllers.ts';
import type { ClinicsServiceContract } from './clinics.domain.ts';
import {
  clinicIdParamsSchema,
  createClinicSchema,
  updateClinicSchema,
} from './clinics.schema.ts';

export function createClinicsRoutes(
  auth: AuthServiceContract,
  service: ClinicsServiceContract,
): Router {
  const router = Router();
  const authenticate = createAuthenticationMiddleware(auth);
  const controllers = createClinicsControllers(service);

  router.use(authenticate);
  router.get('/', createPermissionMiddleware('clinics:view'), controllers.list);
  router.post(
    '/',
    createPermissionMiddleware('clinics:create'),
    validateBody(createClinicSchema),
    controllers.create,
  );
  router.get(
    '/:clinicId',
    createPermissionMiddleware('clinics:view'),
    validateParams(clinicIdParamsSchema),
    controllers.getById,
  );
  router.patch(
    '/:clinicId',
    createPermissionMiddleware('clinics:update'),
    validateParams(clinicIdParamsSchema),
    validateBody(updateClinicSchema),
    controllers.update,
  );
  router.delete(
    '/:clinicId',
    createPermissionMiddleware('clinics:delete'),
    validateParams(clinicIdParamsSchema),
    controllers.deactivate,
  );

  return router;
}
