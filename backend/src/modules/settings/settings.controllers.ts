import type { RequestHandler } from 'express';
import type { SettingInput, SettingsServiceContract } from './settings.domain.ts';
import { listSettingsQuerySchema, settingKeyParamsSchema } from './settings.schema.ts';

type SettingsControllers = {
  list: RequestHandler;
  getByKey: RequestHandler;
  save: RequestHandler;
  delete: RequestHandler;
};

export function createSettingsControllers(service: SettingsServiceContract): SettingsControllers {
  const getSettingKey = (request: Parameters<RequestHandler>[0]) =>
    settingKeyParamsSchema.parse(request.params).key;

  const list: RequestHandler = async (request, response) => {
    response.status(200).json({
      data: await service.list(listSettingsQuerySchema.parse(request.query)),
    });
  };

  const getByKey: RequestHandler = async (request, response) => {
    response.status(200).json({ data: await service.getByKey(getSettingKey(request)) });
  };

  const save: RequestHandler = async (request, response) => {
    response.status(200).json({
      data: await service.save(getSettingKey(request), request.body as SettingInput),
    });
  };

  const deleteSetting: RequestHandler = async (request, response) => {
    await service.delete(getSettingKey(request));
    response.status(204).end();
  };

  return { list, getByKey, save, delete: deleteSetting };
}
