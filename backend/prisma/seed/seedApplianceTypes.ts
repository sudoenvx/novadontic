import type { Prisma } from '../../src/generated/prisma/client.ts';
import { applianceTypeFixtures } from './fixtures.ts';

export async function seedApplianceTypes(
  transaction: Prisma.TransactionClient,
): Promise<void> {
  for (const fixture of applianceTypeFixtures) {
    const applianceType = await transaction.applianceType.upsert({
      where: { code: fixture.code },
      create: {
        code: fixture.code,
        name: fixture.name,
        color: fixture.color,
        isActive: true,
        sortOrder: fixture.sortOrder,
      },
      update: {
        name: fixture.name,
        color: fixture.color,
        isActive: true,
        sortOrder: fixture.sortOrder,
      },
      select: { id: true },
    });

    for (const groupFixture of fixture.groups) {
      const group = await transaction.applianceTypeFieldGroup.upsert({
        where: {
          applianceTypeId_name: {
            applianceTypeId: applianceType.id,
            name: groupFixture.name,
          },
        },
        create: {
          applianceTypeId: applianceType.id,
          name: groupFixture.name,
          sortOrder: groupFixture.sortOrder,
        },
        update: { sortOrder: groupFixture.sortOrder },
        select: { id: true },
      });

      for (const fieldFixture of groupFixture.fields) {
        const options = 'options' in fieldFixture ? fieldFixture.options : [];
        const defaultValue: string | null = null;
        const dependsOn: string | null = null;
        const dependsOnValue: string | null = null;
        const helpText: string | null = null;
        await transaction.applianceTypeField.upsert({
          where: {
            applianceTypeId_fieldKey: {
              applianceTypeId: applianceType.id,
              fieldKey: fieldFixture.key,
            },
          },
          create: {
            applianceTypeId: applianceType.id,
            groupId: group.id,
            fieldKey: fieldFixture.key,
            label: fieldFixture.label,
            dataType: fieldFixture.type,
            isRequired: fieldFixture.required,
            sortOrder: fieldFixture.sortOrder,
            defaultValue,
            dependsOn,
            dependsOnValue,
            helpText,
            selectOptions: options as Prisma.InputJsonValue,
          },
          update: {
            groupId: group.id,
            label: fieldFixture.label,
            dataType: fieldFixture.type,
            isRequired: fieldFixture.required,
            sortOrder: fieldFixture.sortOrder,
            defaultValue,
            dependsOn,
            dependsOnValue,
            helpText,
            selectOptions: options as Prisma.InputJsonValue,
          },
        });
      }
    }
  }
}
