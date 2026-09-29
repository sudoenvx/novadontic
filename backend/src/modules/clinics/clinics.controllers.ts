import type { RequestHandler } from 'express';
import type { ClinicInput, ClinicsServiceContract } from './clinics.domain.ts';
import { clinicIdParamsSchema, listClinicsQuerySchema } from './clinics.schema.ts';

type ClinicsControllers = {
  list: RequestHandler;
  getById: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  deactivate: RequestHandler;
};

export function createClinicsControllers(service: ClinicsServiceContract): ClinicsControllers {
  const getClinicId = (request: Parameters<RequestHandler>[0]) =>
    clinicIdParamsSchema.parse(request.params).clinicId;

  const list: RequestHandler = async (request, response) => {
    response.status(200).json({
      data: await service.list(listClinicsQuerySchema.parse(request.query)),
    });
  };

  const getById: RequestHandler = async (request, response) => {
    response.status(200).json({ data: await service.getById(getClinicId(request)) });
  };

  const create: RequestHandler = async (request, response) => {
    response.status(201).json({ data: await service.create(request.body as ClinicInput) });
  };

  const update: RequestHandler = async (request, response) => {
    response.status(200).json({
      data: await service.update(getClinicId(request), request.body as Partial<ClinicInput>),
    });
  };

  const deactivate: RequestHandler = async (request, response) => {
    await service.deactivate(getClinicId(request));
    response.status(204).end();
  };

  return { list, getById, create, update, deactivate };
}
