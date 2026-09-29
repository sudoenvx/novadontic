import { env } from './env.ts';

export const corsOrigin =
  env.CORS_ORIGIN === '*'
    ? true
    : env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
