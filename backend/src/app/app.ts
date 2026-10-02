import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import type { Express, Router } from 'express';
import { corsOrigin } from '../config/cors.ts';
import { errorHandler } from '../shared/http/error-handler.ts';
import { notFoundHandler } from '../shared/http/not-found-handler.ts';

export function createApp(apiRoutes: Router): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: corsOrigin }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/v1', apiRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}