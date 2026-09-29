import type { RequestHandler } from 'express';
import { AppError } from '../../shared/errors/app-error.ts';
import type { AuthServiceContract, AuthenticatedStaffUser } from './auth.domain.ts';

type AuthControllers = {
  login: RequestHandler;
  refresh: RequestHandler;
  me: RequestHandler;
  logout: RequestHandler;
  authenticate: RequestHandler;
};

function requestMetadata(request: Parameters<RequestHandler>[0]) {
  const userAgent = request.get('user-agent');
  return {
    ...(request.ip ? { ipAddress: request.ip } : {}),
    ...(userAgent ? { userAgent } : {}),
  };
}

function accessToken(request: Parameters<RequestHandler>[0]): string | null {
  return request.get('authorization')?.trim() || null;
}

export function createAuthenticationMiddleware(service: AuthServiceContract): RequestHandler {
  return async (request, response, next) => {
    const token = accessToken(request);
    if (!token) return next(new AppError('Access token is required', 401, 'AUTHENTICATION_REQUIRED'));

    const staffUser = await service.authenticateAccess(token);
    if (!staffUser) return next(new AppError('Access token is invalid or expired', 401, 'INVALID_ACCESS_TOKEN'));
    response.locals['staffUser'] = staffUser;
    next();
  };
}

export function createPermissionMiddleware(permission: string): RequestHandler {
  return (_request, response, next) => {
    const staffUser = response.locals['staffUser'] as AuthenticatedStaffUser | undefined;
    if (!staffUser?.permissions.includes(permission)) {
      return next(new AppError('You do not have permission to perform this action', 403, 'PERMISSION_DENIED'));
    }
    next();
  };
}

export function createAuthControllers(service: AuthServiceContract): AuthControllers {
  const login: RequestHandler = async (request, response) => {
    response.status(201).json({
      data: await service.login(request.body, requestMetadata(request)),
    });
  };

  const refresh: RequestHandler = async (request, response) => {
    response.status(200).json({ data: await service.refresh(request.body) });
  };

  const me: RequestHandler = (_request, response) => {
    response.status(200).json({ data: response.locals['staffUser'] as AuthenticatedStaffUser });
  };

  const logout: RequestHandler = async (_request, response) => {
    const staffUser = response.locals['staffUser'] as AuthenticatedStaffUser;
    await service.logout(staffUser.sessionId, staffUser.id);
    response.status(204).end();
  };

  const authenticate = createAuthenticationMiddleware(service);

  return { login, refresh, me, logout, authenticate };
}
