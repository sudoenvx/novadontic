import { Router } from 'express';
import { validateBody, validateParams } from '../../infrastructure/http/validate.ts';
import type { AuthServiceContract } from '../auth/auth.domain.ts';
import { createAuthenticationMiddleware } from '../auth/auth.controllers.ts';
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
  router.get('/', controllers.list);
  router.post('/', validateBody(createClinicSchema), controllers.create);
  router.get('/:clinicId', validateParams(clinicIdParamsSchema), controllers.getById);
  router.patch(
    '/:clinicId',
    validateParams(clinicIdParamsSchema),
    validateBody(updateClinicSchema),
    controllers.update,
  );
  router.delete('/:clinicId', validateParams(clinicIdParamsSchema), controllers.deactivate);

  return router;
}
