import { Router } from 'express';
import { createAuthRoutes, type AuthServiceContract } from '../modules/auth/index.ts';
import { createAppliancesRoutes, type AppliancesServiceContract } from '../modules/appliances/index.ts';
import { createClinicsRoutes, type ClinicsServiceContract } from '../modules/clinics/index.ts';
import { createDoctorsRoutes, type DoctorsServiceContract } from '../modules/doctors/index.ts';
import { createRolesRoutes, type RolesServiceContract } from '../modules/roles/index.ts';
import { createSettingsRoutes, type SettingsServiceContract } from '../modules/settings/index.ts';
import { createStaffRoutes, type StaffServiceContract } from '../modules/staff/index.ts';

export function createApiRoutes(
  auth: AuthServiceContract,
  appliances: AppliancesServiceContract,
  clinics: ClinicsServiceContract,
  doctors: DoctorsServiceContract,
  roles: RolesServiceContract,
  settings: SettingsServiceContract,
  staff: StaffServiceContract,
): Router {
  const router = Router();
  router.use('/auth', createAuthRoutes(auth));
  router.use('/appliances', createAppliancesRoutes(auth, appliances));
  router.use('/clinics', createClinicsRoutes(auth, clinics));
  router.use('/doctors', createDoctorsRoutes(auth, doctors));
  router.use('/roles', createRolesRoutes(auth, roles));
  router.use('/settings', createSettingsRoutes(auth, settings));
  router.use('/staff', createStaffRoutes(auth, staff));
  return router;
}