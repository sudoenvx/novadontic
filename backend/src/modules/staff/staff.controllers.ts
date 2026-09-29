import type { RequestHandler } from 'express';
import type {
  CreateStaffInput,
  StaffServiceContract,
  UpdateStaffInput,
} from './staff.domain.ts';
import { listStaffQuerySchema, staffIdParamsSchema } from './staff.schema.ts';

type StaffControllers = {
  list: RequestHandler;
  getById: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  setActive: RequestHandler;
  delete: RequestHandler;
};

export function createStaffControllers(service: StaffServiceContract): StaffControllers {
  const list: RequestHandler = async (request, response) => {
    response.status(200).json({
      data: await service.list(listStaffQuerySchema.parse(request.query)),
    });
  };

  const getById: RequestHandler = async (request, response) => {
    const { staffId } = staffIdParamsSchema.parse(request.params);
    response.status(200).json({ data: await service.getById(staffId) });
  };

  const create: RequestHandler = async (request, response) => {
    response.status(201).json({ data: await service.create(request.body as CreateStaffInput) });
  };

  const update: RequestHandler = async (request, response) => {
    const { staffId } = staffIdParamsSchema.parse(request.params);
    response.status(200).json({
      data: await service.update(staffId, request.body as UpdateStaffInput),
    });
  };

  const setActive: RequestHandler = async (request, response) => {
    const { staffId } = staffIdParamsSchema.parse(request.params);
    const { isActive } = request.body as { isActive: boolean };
    const actorId = response.locals['staffUser'].id as string;
    response.status(200).json({
      data: await service.setActive(staffId, isActive, actorId),
    });
  };

  const deleteStaff: RequestHandler = async (request, response) => {
    const { staffId } = staffIdParamsSchema.parse(request.params);
    const actorId = response.locals['staffUser'].id as string;
    await service.delete(staffId, actorId);
    response.status(204).end();
  };

  return { list, getById, create, update, setActive, delete: deleteStaff };
}
