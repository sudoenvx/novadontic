import type { Prisma } from '../../src/generated/prisma/client.ts';
import type { SeedAccount } from './config.ts';

export interface HashedSeedAccount extends Omit<SeedAccount, 'password'> {
  passwordHash: string;
}

export async function seedAccounts(
  transaction: Prisma.TransactionClient,
  accounts: HashedSeedAccount[],
  roleIds: Map<string, bigint>,
): Promise<void> {
  for (const account of accounts) {
    const roleId = roleIds.get(account.roleCode);
    if (roleId === undefined) {
      throw new Error(`Seed account role "${account.roleCode}" was not created.`);
    }

    const user = await transaction.user.upsert({
      where: { email: account.email },
      create: {
        fullName: account.fullName,
        email: account.email,
        passwordHash: account.passwordHash,
        isActive: true,
      },
      update: {
        fullName: account.fullName,
        passwordHash: account.passwordHash,
        isActive: true,
      },
      select: { id: true },
    });

    await transaction.userRole.deleteMany({ where: { userId: user.id } });
    await transaction.userRole.create({ data: { userId: user.id, roleId } });
  }
}
