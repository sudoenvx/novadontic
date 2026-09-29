import { createApp } from './app/app.ts';
import { env } from './config/env.ts';
import { logger } from './config/logger.ts';
import { prisma } from './infrastructure/prisma.ts';

const app = createApp();
const server = app.listen(env.PORT, () => {
  logger.info('API server started', { port: env.PORT, environment: env.NODE_ENV });
});

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info('Shutting down API server', { signal });

  server.close(async (error) => {
    try {
      await prisma.$disconnect();
      if (error) {
        logger.error('HTTP server shutdown failed', { error });
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