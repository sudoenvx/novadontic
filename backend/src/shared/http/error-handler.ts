import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../../config/logger.ts';
import { AppError } from '../errors/app-error.ts';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Request validation failed', details: error.issues },
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: { code: error.code, message: error.message },
    });
    return;
  }

  logger.error('Unhandled request error', { error });
  response.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
  });
};