import type { RequestHandler } from 'express';
import type {
  ApplianceFieldGroupInput,
  ApplianceFieldGroupUpdateInput,
  ApplianceFieldInput,
  ApplianceFieldUpdateInput,
  ApplianceTypeInput,
  ApplianceTypeUpdateInput,
  AppliancesServiceContract,
} from './appliances.domain.ts';
import {
  applianceFieldParamsSchema,
  applianceGroupParamsSchema,
  applianceTypeIdParamsSchema,
  listApplianceTypesQuerySchema,
} from './appliances.schema.ts';

type AppliancesControllers = {
  listTypes: RequestHandler;
  getType: RequestHandler;
  getGroups: RequestHandler;
  createType: RequestHandler;
  updateType: RequestHandler;
  setTypeActive: RequestHandler;
  deleteType: RequestHandler;
  createGroup: RequestHandler;
  updateGroup: RequestHandler;
  deleteGroup: RequestHandler;
  createField: RequestHandler;
  updateField: RequestHandler;
  deleteField: RequestHandler;
};

export function createAppliancesControllers(
  service: AppliancesServiceContract,
): AppliancesControllers {
  const listTypes: RequestHandler = async (request, response) => {
    response.status(200).json({
      data: await service.listTypes(listApplianceTypesQuerySchema.parse(request.query)),
    });
  };

  const getType: RequestHandler = async (request, response) => {
    const { applianceTypeId } = applianceTypeIdParamsSchema.parse(request.params);
    response.status(200).json({ data: await service.getTypeById(applianceTypeId) });
  };

  const getGroups: RequestHandler = async (request, response) => {
    const { applianceTypeId } = applianceTypeIdParamsSchema.parse(request.params);
    response.status(200).json({ data: await service.getGroups(applianceTypeId) });
  };

  const createType: RequestHandler = async (request, response) => {
    response.status(201).json({
      data: await service.createType(request.body as ApplianceTypeInput),
    });
  };

  const updateType: RequestHandler = async (request, response) => {
    const { applianceTypeId } = applianceTypeIdParamsSchema.parse(request.params);
    response.status(200).json({
      data: await service.updateType(
        applianceTypeId,
        request.body as ApplianceTypeUpdateInput,
      ),
    });
  };

  const setTypeActive: RequestHandler = async (request, response) => {
    const { applianceTypeId } = applianceTypeIdParamsSchema.parse(request.params);
    const { isActive } = request.body as { isActive: boolean };
    response.status(200).json({
      data: await service.setTypeActive(applianceTypeId, isActive),
    });
  };

  const deleteType: RequestHandler = async (request, response) => {
    const { applianceTypeId } = applianceTypeIdParamsSchema.parse(request.params);
    await service.deleteType(applianceTypeId);
    response.status(204).end();
  };

  const createGroup: RequestHandler = async (request, response) => {
    const { applianceTypeId } = applianceTypeIdParamsSchema.parse(request.params);
    response.status(201).json({
      data: await service.createGroup(
        applianceTypeId,
        request.body as ApplianceFieldGroupInput,
      ),
    });
  };

  const updateGroup: RequestHandler = async (request, response) => {
    const { applianceTypeId, groupId } = applianceGroupParamsSchema.parse(request.params);
    response.status(200).json({
      data: await service.updateGroup(
        applianceTypeId,
        groupId,
        request.body as ApplianceFieldGroupUpdateInput,
      ),
    });
  };

  const deleteGroup: RequestHandler = async (request, response) => {
    const { applianceTypeId, groupId } = applianceGroupParamsSchema.parse(request.params);
    await service.deleteGroup(applianceTypeId, groupId);
    response.status(204).end();
  };

  const createField: RequestHandler = async (request, response) => {
    const { applianceTypeId, groupId } = applianceGroupParamsSchema.parse(request.params);
    response.status(201).json({
      data: await service.createField(
        applianceTypeId,
        groupId,
        request.body as ApplianceFieldInput,
      ),
    });
  };

  const updateField: RequestHandler = async (request, response) => {
    const { applianceTypeId, groupId, fieldId } = applianceFieldParamsSchema.parse(request.params);
    response.status(200).json({
      data: await service.updateField(
        applianceTypeId,
        groupId,
        fieldId,
        request.body as ApplianceFieldUpdateInput,
      ),
    });
  };

  const deleteField: RequestHandler = async (request, response) => {
    const { applianceTypeId, groupId, fieldId } = applianceFieldParamsSchema.parse(request.params);
    await service.deleteField(applianceTypeId, groupId, fieldId);
    response.status(204).end();
  };

  return {
    listTypes,
    getType,
    getGroups,
    createType,
    updateType,
    setTypeActive,
    deleteType,
    createGroup,
    updateGroup,
    deleteGroup,
    createField,
    updateField,
    deleteField,
  };
}
