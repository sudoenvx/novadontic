import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.ts';

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new AppError(`Route ${request.method} ${request.path} was not found`, 404, 'NOT_FOUND'));
};