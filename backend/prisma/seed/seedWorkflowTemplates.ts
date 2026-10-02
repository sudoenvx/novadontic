import type { Prisma } from '../../src/generated/prisma/client.ts';
import { workflowTemplateFixtures } from './fixtures.ts';

const allowedFileKinds = ['stl', 'photo', 'pdf', 'doc'] satisfies Prisma.InputJsonArray;

export async function seedWorkflowTemplates(
  transaction: Prisma.TransactionClient,
): Promise<void> {
  for (const fixture of workflowTemplateFixtures) {
    const applianceType = await transaction.applianceType.findUnique({
      where: { code: fixture.applianceTypeCode },
      select: { id: true },
    });
    if (!applianceType) {
      throw new Error(
        `Cannot seed ${fixture.name}: appliance type ${fixture.applianceTypeCode} was not seeded.`,
      );
    }

    await transaction.workflowTemplate.updateMany({
      where: { applianceTypeId: applianceType.id },
      data: { isDefault: false },
    });

    const template = await transaction.workflowTemplate.upsert({
      where: { name: fixture.name },
      create: {
        applianceTypeId: applianceType.id,
        name: fixture.name,
        isDefault: true,
      },
      update: {
        applianceTypeId: applianceType.id,
        isDefault: true,
      },
      select: { id: true },
    });

    await transaction.workflowStage.deleteMany({
      where: { templateId: template.id },
    });
    await transaction.workflowStage.createMany({
      data: fixture.stages.map((name, sortOrder) => ({
        templateId: template.id,
        sortOrder,
        name,
        slaHours: null,
        requiresApproval: false,
        allowedFileKinds,
      })),
    });
  }
}
