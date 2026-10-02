import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { createApp } from './app/app.ts';
import { createApiRoutes } from './app/routes.ts';
import { env } from './config/env.ts';
import { logger } from './config/logger.ts';
import { database } from './infrastructure/database/mysql.client.ts';
import { AppliancesService } from './modules/appliances/index.ts';
import { AuthService } from './modules/auth/index.ts';
import { ClinicsService } from './modules/clinics/index.ts';
import { DoctorsService } from './modules/doctors/index.ts';
import { RolesService } from './modules/roles/index.ts';
import { SettingsService } from './modules/settings/index.ts';
import { StaffService } from './modules/staff/index.ts';
import { WorkflowsService } from './modules/workflows/index.ts';
import { CaseAssetsService, CaseFileStorage, CasesService } from './modules/cases/index.ts';
import { attachSocketServer } from './shared/realtime/socket-server.ts';
import { AccessTokenService } from './shared/security/access-tokens.ts';
import { BcryptPasswordHasher } from './shared/security/passwords.ts';

const passwordHasher = new BcryptPasswordHasher();
const auth = new AuthService(
  database,
  passwordHasher,
  new AccessTokenService(env.AUTH_JWT_SECRET, env.AUTH_ACCESS_TOKEN_TTL_SECONDS),
  env.AUTH_ACCESS_TOKEN_TTL_SECONDS,
);
const appliances = new AppliancesService(database);
const clinics = new ClinicsService(database);
const doctors = new DoctorsService(database);
const roles = new RolesService(database);
const settings = new SettingsService(database);
const staff = new StaffService(database, passwordHasher);
const workflows = new WorkflowsService(database);
const cases = new CasesService(database);
const caseFileStorage = new CaseFileStorage(resolve(process.cwd(), env.CASE_FILES_STORAGE_DIR));
const caseAssets = new CaseAssetsService(database, caseFileStorage);
const app = createApp(createApiRoutes(
  auth,
  appliances,
  clinics,
  doctors,
  roles,
  settings,
  staff,
  workflows,
  cases,
  caseAssets,
  caseFileStorage,
));
const server = createServer(app);
const io = attachSocketServer(server);

server.listen(env.PORT, () => {
  logger.info('API server started', { port: env.PORT, environment: env.NODE_ENV });
});

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info('Shutting down API server', { signal });

  io.close(async (error) => {
    try {
      await database.$disconnect();
      if (error) {
        logger.error('Server shutdown failed', { error });
        process.exitCode = 1;
      }
    } catch (closeError) {
      logger.error('Prisma client shutdown failed', { error: closeError });
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));