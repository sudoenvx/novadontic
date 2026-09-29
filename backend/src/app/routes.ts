import { Router } from 'express';
import { createAuthRoutes, type AuthServiceContract } from '../modules/auth/index.ts';
import { createClinicsRoutes, type ClinicsServiceContract } from '../modules/clinics/index.ts';

export function createApiRoutes(
  auth: AuthServiceContract,
  clinics: ClinicsServiceContract,
): Router {
  const router = Router();
  router.use('/auth', createAuthRoutes(auth));
  router.use('/clinics', createClinicsRoutes(auth, clinics));
  return router;
}