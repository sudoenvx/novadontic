import type { Prisma } from '../../src/generated/prisma/client.ts';
import { permissionDefinitions, roleDefinitions, type SeedRoleCode } from './catalog.ts';

const technicianPermissions = new Set([
  'dashboard:view',
  'cases:view',
  'cases:update',
  'cases:move',
  'case_files:view',
  'case_files:upload',
  'case_files:update',
  'case_files:download',
  'case_activity:view',
  'case_activity:add_note',
  'production_steps:view',
  'production_steps:assign',
  'production_steps:update',
  'appliances:view',
  'appliance_fields:view',
  'workflows:view',
  'doctors:view',
  'clinics:view',
  'staff:view',
]);

const qualityControllerPermissions = new Set([
  'dashboard:view',
  'cases:view',
  'cases:update',
  'cases:approve',
  'cases:move',
  'case_files:view',
  'case_files:upload',
  'case_files:update',
  'case_files:download',
  'case_activity:view',
  'case_activity:add_note',
  'production_steps:view',
  'production_steps:update',
  'appliances:view',
  'appliance_fields:view',
  'workflows:view',
  'doctors:view',
  'clinics:view',
]);

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

    const grantedPermissions = permissionsForRole(definition.code);

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

function permissionsForRole(roleCode: SeedRoleCode) {
  if (roleCode === 'owner' || roleCode === 'administrator') {
    return permissionDefinitions;
  }
  const allowedPermissions = roleCode === 'technician'
    ? technicianPermissions
    : qualityControllerPermissions;
  return permissionDefinitions.filter(([code]) => allowedPermissions.has(code));
}
