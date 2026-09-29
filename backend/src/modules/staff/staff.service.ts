import type { Prisma, PrismaClient } from '../../generated/prisma/client.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import type { PasswordHasher } from '../../shared/security/passwords.ts';
import type {
  CreateStaffInput,
  StaffListInput,
  StaffListResult,
  StaffMember,
  StaffRole,
  StaffServiceContract,
  UpdateStaffInput,
} from './staff.domain.ts';

const staffInclude = {
  roles: {
    include: { role: { select: { id: true, code: true, name: true } } },
    orderBy: { roleId: 'asc' },
  },
} satisfies Prisma.UserInclude;

type StaffRow = Prisma.UserGetPayload<{ include: typeof staffInclude }>;

function toStaffRole(role: StaffRow['roles'][number]['role']): StaffRole {
  return { id: role.id.toString(), code: role.code, name: role.name };
}

function toStaffMember(row: StaffRow): StaffMember {
  return {
    id: row.id.toString(),
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    roles: row.roles.map(({ role }) => toStaffRole(role)),
  };
}

function isPrismaError(error: unknown, code: string): boolean {
  return error instanceof Error && 'code' in error && error.code === code;
}

function staffNotFound(): AppError {
  return new AppError('Staff member was not found', 404, 'STAFF_NOT_FOUND');
}

function staffEmailExists(): AppError {
  return new AppError('A staff member with this email already exists', 409, 'STAFF_EMAIL_EXISTS');
}

export class StaffService implements StaffServiceContract {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async list(input: StaffListInput): Promise<StaffListResult> {
    const filters: Prisma.UserWhereInput = {
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.search
        ? {
            OR: [
              { fullName: { contains: input.search } },
              { email: { contains: input.search } },
              { phone: { contains: input.search } },
            ],
          }
        : {}),
    };
    const where: Prisma.UserWhereInput = {
      ...filters,
      ...(input.cursor ? { id: { gt: BigInt(input.cursor) } } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: staffInclude,
        orderBy: { id: 'asc' },
        take: input.limit + 1,
      }),
      this.prisma.user.count({ where: filters }),
    ]);
    const hasMore = rows.length > input.limit;
    const data = rows.slice(0, input.limit).map(toStaffMember);
    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id ?? null : null,
      total,
    };
  }

  async getById(id: string): Promise<StaffMember> {
    const row = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      include: staffInclude,
    });
    if (!row) throw staffNotFound();
    return toStaffMember(row);
  }

  async create(input: CreateStaffInput): Promise<StaffMember> {
    const passwordHash = await this.passwordHasher.hash(input.password);

    try {
      const row = await this.prisma.$transaction(async (transaction) => {
        const roles = await this.getAssignableRoles(transaction, input.roleIds);
        return transaction.user.create({
          data: {
            fullName: input.fullName,
            email: input.email,
            passwordHash,
            ...(input.phone !== undefined ? { phone: input.phone } : {}),
            roles: {
              create: roles.map(({ id }) => ({ roleId: id })),
            },
          },
          include: staffInclude,
        });
      });
      return toStaffMember(row);
    } catch (error) {
      if (isPrismaError(error, 'P2002')) throw staffEmailExists();
      throw error;
    }
  }

  async update(id: string, input: UpdateStaffInput): Promise<StaffMember> {
    try {
      const row = await this.prisma.$transaction(async (transaction) => {
        const current = await transaction.user.findUnique({
          where: { id: BigInt(id) },
          select: {
            id: true,
            roles: { select: { role: { select: { code: true } } } },
          },
        });
        if (!current) throw staffNotFound();
        this.assertNotOwner(current.roles.map(({ role }) => role.code));

        const roleIds = input.roleIds;
        const assignableRoles = roleIds
          ? await this.getAssignableRoles(transaction, roleIds)
          : undefined;

        if (assignableRoles) {
          await transaction.userRole.deleteMany({ where: { userId: current.id } });
          await transaction.userRole.createMany({
            data: assignableRoles.map(({ id: roleId }) => ({
              userId: current.id,
              roleId,
            })),
          });
        }

        return transaction.user.update({
          where: { id: current.id },
          data: {
            ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
            ...(input.email !== undefined ? { email: input.email } : {}),
            ...(input.phone !== undefined ? { phone: input.phone } : {}),
          },
          include: staffInclude,
        });
      });
      return toStaffMember(row);
    } catch (error) {
      if (isPrismaError(error, 'P2002')) throw staffEmailExists();
      if (isPrismaError(error, 'P2025')) throw staffNotFound();
      throw error;
    }
  }

  async setActive(id: string, isActive: boolean, actorId: string): Promise<StaffMember> {
    if (!isActive && id === actorId) {
      throw new AppError('You cannot suspend your own staff account', 409, 'CANNOT_SUSPEND_SELF');
    }

    return this.prisma.$transaction(async (transaction) => {
      const userId = BigInt(id);
      const current = await transaction.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          roles: { select: { role: { select: { code: true } } } },
        },
      });
      if (!current) throw staffNotFound();
      this.assertNotOwner(current.roles.map(({ role }) => role.code));

      const updated = await transaction.user.update({
        where: { id: userId },
        data: { isActive },
        include: staffInclude,
      });
      if (!isActive) {
        await transaction.authSession.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      return toStaffMember(updated);
    });
  }

  async delete(id: string, actorId: string): Promise<void> {
    if (id === actorId) {
      throw new AppError('You cannot delete your own staff account', 409, 'CANNOT_DELETE_SELF');
    }
    await this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.findUnique({
        where: { id: BigInt(id) },
        select: {
          id: true,
          roles: { select: { role: { select: { code: true } } } },
        },
      });
      if (!user) throw staffNotFound();
      this.assertNotOwner(user.roles.map(({ role }) => role.code));
      await transaction.user.delete({ where: { id: user.id } });
    });
  }

  private async getAssignableRoles(
    transaction: Prisma.TransactionClient,
    roleIds: string[],
  ): Promise<{ id: bigint }[]> {
    const roles = await transaction.role.findMany({
      where: { id: { in: roleIds.map(BigInt) } },
      select: { id: true, code: true },
    });
    if (roles.length !== roleIds.length) {
      throw new AppError('One or more roles were not found', 422, 'STAFF_ROLE_NOT_FOUND');
    }
    if (roles.some(({ code }) => code === 'owner')) {
      throw new AppError('The owner role cannot be assigned through staff management', 409, 'OWNER_ROLE_ASSIGNMENT_DENIED');
    }
    return roles.map(({ id }) => ({ id }));
  }

  private assertNotOwner(roleCodes: string[]): void {
    if (roleCodes.includes('owner')) {
      throw new AppError('The account owner cannot be changed through staff management', 409, 'OWNER_STAFF_IMMUTABLE');
    }
  }
}
