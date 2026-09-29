import type { Prisma } from '../../src/generated/prisma/client.ts';
import { clinicFixtures, doctorFixtures } from './fixtures.ts';

export async function seedClinicsAndDoctors(
  transaction: Prisma.TransactionClient,
): Promise<void> {
  const clinicIds = new Map<string, bigint>();

  for (const fixture of clinicFixtures) {
    const existing = await transaction.clinic.findFirst({
      where: { name: fixture.name },
      select: { id: true },
    });
    const clinic = existing
      ? await transaction.clinic.update({
          where: { id: existing.id },
          data: { ...fixture, isActive: true },
          select: { id: true },
        })
      : await transaction.clinic.create({
          data: { ...fixture, isActive: true },
          select: { id: true },
        });
    clinicIds.set(fixture.name, clinic.id);
  }

  for (const fixture of doctorFixtures) {
    const { clinicName, ...doctorData } = fixture;
    const doctor = await transaction.doctor.upsert({
      where: { email: fixture.email },
      create: doctorData,
      update: doctorData,
      select: { id: true },
    });

    await transaction.clinicDoctor.deleteMany({ where: { doctorId: doctor.id } });
    if (!clinicName) continue;

    const clinicId = clinicIds.get(clinicName);
    if (clinicId === undefined) {
      throw new Error(`Seed clinic "${clinicName}" was not created.`);
    }
    await transaction.clinicDoctor.create({
      data: { clinicId, doctorId: doctor.id },
    });
  }
}
