import type { Prisma, PrismaClient } from '../../generated/prisma/client.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import type {
  Permission,
  Role,
  RoleInput,
  RoleListInput,
  RoleUpdateInput,
  RolesServiceContract,
} from './roles.domain.ts';

const roleInclude = {
  permissions: { include: { permission: true } },
  _count: { select: { users: true } },
} satisfies Prisma.RoleInclude;

type RoleRow = Prisma.RoleGetPayload<{ include: typeof roleInclude }>;

function toRole(row: RoleRow): Role {
  return {
    id: row.id.toString(),
    code: row.code,
    name: row.name,
    description: row.description ?? '',
    type: row.code === 'owner' ? 'owner' : row.isSystem ? 'system' : 'custom',
    isSystem: row.isSystem,
    staffCount: row._count.users,
    permissions: row.permissions.map(({ permission }) => permission.code).sort(),
  };
}

function roleCode(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

function isPrismaError(error: unknown, code: string): boolean {
  return error instanceof Error && 'code' in error && error.code === code;
}

function roleNotFound(): AppError {
  return new AppError('Role was not found', 404, 'ROLE_NOT_FOUND');
}

export class RolesService implements RolesServiceContract {
  constructor(private readonly prisma: PrismaClient) {}

  async listPermissions(module?: string): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      ...(module ? { where: { module } } : {}),
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
      select: { code: true, module: true, description: true },
    });
  }

  async list(input: RoleListInput): Promise<Role[]> {
    const rows = await this.prisma.role.findMany({
      ...(input.search
        ? {
            where: {
              OR: [
                { name: { contains: input.search } },
                { description: { contains: input.search } },
              ],
            },
          }
        : {}),
      include: roleInclude,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    return rows.map(toRole);
  }

  async getById(id: string): Promise<Role> {
    const role = await this.prisma.role.findUnique({
      where: { id: BigInt(id) },
      include: roleInclude,
    });
    if (!role) throw roleNotFound();
    return toRole(role);
  }

  async create(input: RoleInput): Promise<Role> {
    const code = roleCode(input.name);
    if (!code) throw new AppError('Role name must contain letters or numbers', 422, 'INVALID_ROLE_NAME');

    try {
      const role = await this.prisma.role.create({
        data: { code, name: input.name, description: input.description },
        include: roleInclude,
      });
      return toRole(role);
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new AppError('A role with this name already exists', 409, 'ROLE_ALREADY_EXISTS');
      }
      throw error;
    }
  }

  async update(id: string, input: RoleUpdateInput): Promise<Role> {
    try {
      const role = await this.prisma.role.update({
        where: { id: BigInt(id) },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
        },
        include: roleInclude,
      });
      return toRole(role);
    } catch (error) {
      if (isPrismaError(error, 'P2025')) throw roleNotFound();
      throw error;
    }
  }

  async setPermissions(id: string, permissionCodes: string[]): Promise<Role> {
    return this.prisma.$transaction(async (transaction) => {
      const role = await transaction.role.findUnique({
        where: { id: BigInt(id) },
        select: { id: true, code: true },
      });
      if (!role) throw roleNotFound();
      if (role.code === 'owner') {
        throw new AppError('The owner role always has all permissions', 409, 'OWNER_PERMISSIONS_IMMUTABLE');
      }

      const permissions = await transaction.permission.findMany({
        where: { code: { in: permissionCodes } },
        select: { id: true, code: true },
      });
      if (permissions.length !== permissionCodes.length) {
        throw new AppError('One or more permission codes are invalid', 422, 'INVALID_PERMISSION_CODES');
      }

      await transaction.rolePermission.deleteMany({ where: { roleId: role.id } });
      if (permissions.length > 0) {
        await transaction.rolePermission.createMany({
          data: permissions.map((permission) => ({
            roleId: role.id,
            permissionId: permission.id,
          })),
        });
      }

      const updated = await transaction.role.findUnique({
        where: { id: role.id },
        include: roleInclude,
      });
      if (!updated) throw roleNotFound();
      return toRole(updated);
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      const role = await transaction.role.findUnique({
        where: { id: BigInt(id) },
        select: { id: true, code: true, isSystem: true },
      });
      if (!role) throw roleNotFound();
      if (role.code === 'owner' || role.isSystem) {
        throw new AppError('System roles cannot be deleted', 409, 'SYSTEM_ROLE_IMMUTABLE');
      }

      const assignedUsers = await transaction.userRole.count({ where: { roleId: role.id } });
      if (assignedUsers > 0) {
        throw new AppError('Roles assigned to staff cannot be deleted', 409, 'ROLE_IN_USE');
      }
      await transaction.role.delete({ where: { id: role.id } });
    });
  }
}
