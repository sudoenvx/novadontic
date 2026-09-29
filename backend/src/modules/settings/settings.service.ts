import type { PrismaClient } from '../../generated/prisma/client.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import type {
  Setting,
  SettingInput,
  SettingListInput,
  SettingsServiceContract,
} from './settings.domain.ts';

export class SettingsService implements SettingsServiceContract {
  constructor(private readonly prisma: PrismaClient) {}

  async list(input: SettingListInput): Promise<Setting[]> {
    return this.prisma.setting.findMany({
      where: input.group === undefined ? {} : { group: input.group },
      orderBy: { key: 'asc' },
    });
  }

  async getByKey(key: string): Promise<Setting> {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) throw this.settingNotFound(key);
    return setting;
  }

  async save(key: string, input: SettingInput): Promise<Setting> {
    return this.prisma.setting.upsert({
      where: { key },
      create: {
        key,
        value: input.value,
        group: input.group ?? null,
      },
      update: {
        value: input.value,
        ...(input.group !== undefined ? { group: input.group } : {}),
      },
    });
  }

  async delete(key: string): Promise<void> {
    try {
      await this.prisma.setting.delete({ where: { key } });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw this.settingNotFound(key);
      }
      throw error;
    }
  }

  private settingNotFound(key: string): AppError {
    return new AppError(`Setting "${key}" was not found`, 404, 'SETTING_NOT_FOUND');
  }
}
