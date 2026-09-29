import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

import { ValidationError } from '../errors/app-error.ts';

function replaceRequestValue(
  request: Parameters<RequestHandler>[0],
  key: 'body' | 'params' | 'query',
  value: unknown,
): void {
  Object.defineProperty(request, key, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  });
}

export const validateBody = <TSchema extends ZodType>(
  schema: TSchema,
): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new ValidationError('Request body validation failed.', result.error.flatten()),
      );
      return;
    }

    replaceRequestValue(req, 'body', result.data);
    next();
  };
};

export const validateParams = <TSchema extends ZodType>(
  schema: TSchema,
): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      next(
        new ValidationError('Request parameter validation failed.', result.error.flatten()),
      );
      return;
    }

    replaceRequestValue(req, 'params', result.data);
    next();
  };
};

export const validateQuery = <TSchema extends ZodType>(
  schema: TSchema,
): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      next(
        new ValidationError('Request query validation failed.', result.error.flatten()),
      );
      return;
    }

    replaceRequestValue(req, 'query', result.data);
    next();
  };
};
