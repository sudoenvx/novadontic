import type { Prisma } from '../../src/generated/prisma/client.ts';
import { settingFixtures } from './fixtures.ts';

export async function seedSettings(transaction: Prisma.TransactionClient): Promise<void> {
  for (const setting of settingFixtures) {
    await transaction.setting.upsert({
      where: { key: setting.key },
      create: setting,
      update: { value: setting.value, group: setting.group },
    });
  }
}
