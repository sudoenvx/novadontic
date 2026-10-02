import { z } from 'zod';

const seedEnvironmentSchema = z.object({
  SEED_OWNER_EMAIL: z.email().trim().toLowerCase().default('owner@example.test'),
  SEED_OWNER_PASSWORD: z.string().min(3),
  SEED_ADMINISTRATOR_EMAIL: z.email().trim().toLowerCase().default('administrator@example.test'),
  SEED_ADMINISTRATOR_PASSWORD: z.string().min(3),
  SEED_TECHNICIAN_EMAIL: z.email().trim().toLowerCase().optional(),
  SEED_TECHNICIAN_PASSWORD: z.string().min(3).optional(),
  SEED_DEVELOPER_EMAIL: z.email().trim().toLowerCase().optional(),
  SEED_DEVELOPER_PASSWORD: z.string().min(3).optional(),
});

export interface SeedAccount {
  fullName: string;
  email: string;
  password: string;
  roleCode: string;
}

export function getSeedAccounts(environment: NodeJS.ProcessEnv): SeedAccount[] {
  const parsed = seedEnvironmentSchema.safeParse({
    ...environment,
    SEED_TECHNICIAN_EMAIL:
      environment['SEED_TECHNICIAN_EMAIL'] ??
      environment['SEED_DEVELOPER_EMAIL'] ??
      'technician@example.test',
    SEED_TECHNICIAN_PASSWORD:
      environment['SEED_TECHNICIAN_PASSWORD'] ??
      environment['SEED_DEVELOPER_PASSWORD'],
  });
  if (!parsed.success) {
    const invalidNames = [...new Set(
      parsed.error.issues.map((issue) => String(issue.path[0])),
    )];
    throw new Error(
      `Provide valid seed account configuration; passwords must be at least 12 characters: ${invalidNames.join(', ')}`,
    );
  }

  const { data } = parsed;
  const technicianEmail = data.SEED_TECHNICIAN_EMAIL ?? 'technician@example.test';
  const accounts: SeedAccount[] = [
    {
      fullName: 'Lab Owner',
      email: data.SEED_OWNER_EMAIL,
      password: data.SEED_OWNER_PASSWORD,
      roleCode: 'owner',
    },
    {
      fullName: 'Lab Administrator',
      email: data.SEED_ADMINISTRATOR_EMAIL,
      password: data.SEED_ADMINISTRATOR_PASSWORD,
      roleCode: 'administrator',
    },
    {
      fullName: 'Lab Technician',
      email: technicianEmail,
      password: data.SEED_TECHNICIAN_PASSWORD ?? '',
      roleCode: 'technician',
    },
  ];

  if (!data.SEED_TECHNICIAN_PASSWORD) {
    throw new Error('Provide SEED_TECHNICIAN_PASSWORD (or legacy SEED_DEVELOPER_PASSWORD).');
  }
  if (new Set(accounts.map(({ email }) => email)).size !== accounts.length) {
    throw new Error('Seed account email addresses must be unique.');
  }
  if (new Set(accounts.map(({ password }) => password)).size !== accounts.length) {
    throw new Error('Seed account passwords must be unique.');
  }
  return accounts;
}
