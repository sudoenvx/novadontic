import { Router } from 'express';
import { validateBody } from '../../infrastructure/http/validate.ts';
import type { AuthServiceContract } from './auth.domain.ts';
import { createAuthControllers } from './auth.controllers.ts';
import { loginSchema, refreshSessionSchema } from './auth.schema.ts';

export function createAuthRoutes(service: AuthServiceContract): Router {
  const router = Router();
  const controllers = createAuthControllers(service);

  router.post('/sessions', validateBody(loginSchema), controllers.login);
  router.post('/sessions/refresh', validateBody(refreshSessionSchema), controllers.refresh);
  router.get('/me', controllers.authenticate, controllers.me);
  router.delete('/sessions/current', controllers.authenticate, controllers.logout);

  return router;
}
