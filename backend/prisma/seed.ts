import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { BcryptPasswordHasher } from '../src/shared/security/passwords.ts';
import { getSeedAccounts } from './seed/config.ts';
import { seedApplianceTypes } from './seed/seedApplianceTypes.ts';
import { seedAccessControl } from './seed/seedAccessControl.ts';
import { seedAccounts } from './seed/seedAccounts.ts';
import { seedClinicsAndDoctors } from './seed/seedClinicsAndDoctors.ts';
import { seedSettings } from './seed/seedSettings.ts';
import { seedWorkflowTemplates } from './seed/seedWorkflowTemplates.ts';

async function seedDatabase(): Promise<void> {
  if (process.env['NODE_ENV'] === 'production') {
    throw new Error('Refusing to seed demo data when NODE_ENV is production.');
  }

  const databaseUrl = process.env['DATABASE_URL']?.trim();
  if (!databaseUrl) throw new Error('DATABASE_URL is required to seed the database.');

  const seedAccountsConfig = getSeedAccounts(process.env);
  const passwordHasher = new BcryptPasswordHasher();
  const hashedAccounts = await Promise.all(
    seedAccountsConfig.map(async ({ password, ...account }) => ({
      ...account,
      passwordHash: await passwordHasher.hash(password),
    })),
  );
  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });

  try {
    await prisma.$transaction(async (transaction) => {
      const roleIds = await seedAccessControl(transaction);
      await seedAccounts(transaction, hashedAccounts, roleIds);
      await seedApplianceTypes(transaction);
      await seedWorkflowTemplates(transaction);
      await seedClinicsAndDoctors(transaction);
      await seedSettings(transaction);
    });
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase().catch((error: unknown) => {
  console.error('Database seeding failed.', error);
  process.exitCode = 1;
});
