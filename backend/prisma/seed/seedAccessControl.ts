import type { Prisma } from '../../src/generated/prisma/client.ts';
import { permissionDefinitions, roleDefinitions } from './catalog.ts';

export async function seedAccessControl(
  transaction: Prisma.TransactionClient,
): Promise<Map<string, bigint>> {
  const roleIds = new Map<string, bigint>();
  const permissionIds = new Map<string, bigint>();

  for (const definition of roleDefinitions) {
    const role = await transaction.role.upsert({
      where: { code: definition.code },
      create: { ...definition, isSystem: true },
      update: { ...definition, isSystem: true },
      select: { id: true },
    });
    roleIds.set(definition.code, role.id);
  }

  for (const [code, module, description] of permissionDefinitions) {
    const permission = await transaction.permission.upsert({
      where: { code },
      create: { code, module, description },
      update: { module, description },
      select: { id: true },
    });
    permissionIds.set(code, permission.id);
  }

  for (const definition of roleDefinitions) {
    const roleId = roleIds.get(definition.code);
    if (roleId === undefined) throw new Error(`Seed role "${definition.code}" was not created.`);

    const grantedPermissions = definition.code === 'developer'
      ? permissionDefinitions.filter(([code]) => !code.startsWith('account:'))
      : permissionDefinitions;

    await transaction.rolePermission.deleteMany({ where: { roleId } });
    await transaction.rolePermission.createMany({
      data: grantedPermissions.map(([code]) => {
        const permissionId = permissionIds.get(code);
        if (permissionId === undefined) {
          throw new Error(`Seed permission "${code}" was not created.`);
        }
        return { roleId, permissionId };
      }),
    });
  }

  return roleIds;
}
