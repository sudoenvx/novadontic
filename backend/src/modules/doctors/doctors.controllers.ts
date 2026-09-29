import type { RequestHandler } from 'express';
import type {
  DoctorInput,
  DoctorUpdateInput,
  DoctorsServiceContract,
} from './doctors.domain.ts';
import { doctorIdParamsSchema, listDoctorsQuerySchema } from './doctors.schema.ts';

type DoctorsControllers = {
  list: RequestHandler;
  getById: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
};

export function createDoctorsControllers(service: DoctorsServiceContract): DoctorsControllers {
  const getDoctorId = (request: Parameters<RequestHandler>[0]) =>
    doctorIdParamsSchema.parse(request.params).doctorId;

  const list: RequestHandler = async (request, response) => {
    response.status(200).json({
      data: await service.list(listDoctorsQuerySchema.parse(request.query)),
    });
  };

  const getById: RequestHandler = async (request, response) => {
    response.status(200).json({ data: await service.getById(getDoctorId(request)) });
  };

  const create: RequestHandler = async (request, response) => {
    response.status(201).json({ data: await service.create(request.body as DoctorInput) });
  };

  const update: RequestHandler = async (request, response) => {
    response.status(200).json({
      data: await service.update(getDoctorId(request), request.body as DoctorUpdateInput),
    });
  };

  const deleteDoctor: RequestHandler = async (request, response) => {
    await service.delete(getDoctorId(request));
    response.status(204).end();
  };

  return { list, getById, create, update, delete: deleteDoctor };
}
