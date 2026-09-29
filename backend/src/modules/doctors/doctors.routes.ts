import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../../infrastructure/http/validate.ts';
import {
  createAuthenticationMiddleware,
  createPermissionMiddleware,
} from '../auth/auth.controllers.ts';
import type { AuthServiceContract } from '../auth/auth.domain.ts';
import { createDoctorsControllers } from './doctors.controllers.ts';
import type { DoctorsServiceContract } from './doctors.domain.ts';
import {
  createDoctorSchema,
  doctorIdParamsSchema,
  listDoctorsQuerySchema,
  updateDoctorSchema,
} from './doctors.schema.ts';

export function createDoctorsRoutes(
  auth: AuthServiceContract,
  service: DoctorsServiceContract,
): Router {
  const router = Router();
  const controllers = createDoctorsControllers(service);

  router.use(createAuthenticationMiddleware(auth));
  router.get(
    '/',
    createPermissionMiddleware('doctors:view'),
    validateQuery(listDoctorsQuerySchema),
    controllers.list,
  );
  router.post(
    '/',
    createPermissionMiddleware('doctors:create'),
    validateBody(createDoctorSchema),
    controllers.create,
  );
  router.get(
    '/:doctorId',
    createPermissionMiddleware('doctors:view'),
    validateParams(doctorIdParamsSchema),
    controllers.getById,
  );
  router.patch(
    '/:doctorId',
    createPermissionMiddleware('doctors:update'),
    validateParams(doctorIdParamsSchema),
    validateBody(updateDoctorSchema),
    controllers.update,
  );
  router.delete(
    '/:doctorId',
    createPermissionMiddleware('doctors:delete'),
    validateParams(doctorIdParamsSchema),
    controllers.delete,
  );
  return router;
}
