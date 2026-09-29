import type { RequestHandler } from 'express';
import type { RoleInput, RoleUpdateInput, RolesServiceContract } from './roles.domain.ts';
import {
  listPermissionsQuerySchema,
  listRolesQuerySchema,
  roleIdParamsSchema,
} from './roles.schema.ts';

type RolesControllers = {
  listPermissions: RequestHandler;
  list: RequestHandler;
  getById: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  setPermissions: RequestHandler;
  delete: RequestHandler;
};

export function createRolesControllers(service: RolesServiceContract): RolesControllers {
  const getRoleId = (request: Parameters<RequestHandler>[0]) =>
    roleIdParamsSchema.parse(request.params).roleId;

  const listPermissions: RequestHandler = async (request, response) => {
    const query = listPermissionsQuerySchema.parse(request.query);
    response.status(200).json({ data: await service.listPermissions(query.module) });
  };

  const list: RequestHandler = async (request, response) => {
    response.status(200).json({
      data: await service.list(listRolesQuerySchema.parse(request.query)),
    });
  };

  const getById: RequestHandler = async (request, response) => {
    response.status(200).json({ data: await service.getById(getRoleId(request)) });
  };

  const create: RequestHandler = async (request, response) => {
    response.status(201).json({ data: await service.create(request.body as RoleInput) });
  };

  const update: RequestHandler = async (request, response) => {
    response.status(200).json({
      data: await service.update(getRoleId(request), request.body as RoleUpdateInput),
    });
  };

  const setPermissions: RequestHandler = async (request, response) => {
    const { permissionCodes } = request.body as { permissionCodes: string[] };
    response.status(200).json({
      data: await service.setPermissions(getRoleId(request), permissionCodes),
    });
  };

  const deleteRole: RequestHandler = async (request, response) => {
    await service.delete(getRoleId(request));
    response.status(204).end();
  };

  return { listPermissions, list, getById, create, update, setPermissions, delete: deleteRole };
}
