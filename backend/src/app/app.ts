import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import type { Express } from 'express';
import { env } from '../config/env.ts';
import { errorHandler } from '../shared/http/error-handler.ts';
import { notFoundHandler } from '../shared/http/not-found-handler.ts';

export function createApp(): Express {
  const app = express();
  const corsOrigins = env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: corsOrigins }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}