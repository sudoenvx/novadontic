import { createServer } from 'node:http';
import { createApp } from './app/app.ts';
import { createApiRoutes } from './app/routes.ts';
import { corsOrigin } from './config/cors.ts';
import { env } from './config/env.ts';
import { logger } from './config/logger.ts';
import { database } from './infrastructure/database/mysql.client.ts';
import { AuthService } from './modules/auth/index.ts';
import { ClinicsService } from './modules/clinics/index.ts';
import { attachSocketServer } from './shared/realtime/socket-server.ts';
import { AccessTokenService } from './shared/security/access-tokens.ts';
import { Argon2PasswordHasher } from './shared/security/passwords.ts';

const passwordHasher = new Argon2PasswordHasher();
const auth = new AuthService(
  database,
  passwordHasher,
  new AccessTokenService(env.AUTH_JWT_SECRET, env.AUTH_ACCESS_TOKEN_TTL_SECONDS),
  env.AUTH_ACCESS_TOKEN_TTL_SECONDS,
);
const clinics = new ClinicsService(database);
const app = createApp(createApiRoutes(auth, clinics));
const server = createServer(app);
const io = attachSocketServer(server, corsOrigin);

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