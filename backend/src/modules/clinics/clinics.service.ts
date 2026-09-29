import type { Prisma, PrismaClient } from '../../generated/prisma/client.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import type {
  Clinic,
  ClinicInput,
  ClinicListInput,
  ClinicListResult,
  ClinicsServiceContract,
} from './clinics.domain.ts';

const clinicInclude = {
  doctors: {
    include: {
      doctor: {
        select: { id: true, fullName: true, email: true, specialty: true, isActive: true },
      },
    },
  },
} satisfies Prisma.ClinicInclude;

type ClinicRow = Prisma.ClinicGetPayload<{ include: typeof clinicInclude }>;

function toClinic(row: ClinicRow): Clinic {
  return {
    id: row.id.toString(),
    name: row.name,
    legalName: row.legalName,
    email: row.email,
    phone: row.phone,
    website: row.website,
    address: row.address,
    city: row.city,
    notes: row.notes,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    doctors: row.doctors.map(({ doctor }) => ({
      id: doctor.id.toString(),
      fullName: doctor.fullName,
      email: doctor.email,
      specialty: doctor.specialty,
      isActive: doctor.isActive,
    })),
  };
}

function clinicData(input: Partial<ClinicInput>): Prisma.ClinicUpdateInput {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.legalName !== undefined ? { legalName: input.legalName } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.website !== undefined ? { website: input.website } : {}),
    ...(input.address !== undefined ? { address: input.address } : {}),
    ...(input.city !== undefined ? { city: input.city } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
  };
}

function newClinicData(input: ClinicInput): Prisma.ClinicCreateInput {
  return {
    name: input.name,
    ...(input.legalName !== undefined ? { legalName: input.legalName } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.website !== undefined ? { website: input.website } : {}),
    ...(input.address !== undefined ? { address: input.address } : {}),
    ...(input.city !== undefined ? { city: input.city } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
  };
}

export class ClinicsService implements ClinicsServiceContract {
  constructor(private readonly prisma: PrismaClient) {}

  async list(input: ClinicListInput): Promise<ClinicListResult> {
    const filters: Prisma.ClinicWhereInput = {
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search } },
              { legalName: { contains: input.search } },
              { email: { contains: input.search } },
              { city: { contains: input.search } },
            ],
          }
        : {}),
    };
    const where: Prisma.ClinicWhereInput = {
      ...filters,
      ...(input.cursor ? { id: { gt: BigInt(input.cursor) } } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.clinic.findMany({
        where,
        include: clinicInclude,
        orderBy: { id: 'asc' },
        take: input.limit + 1,
      }),
      this.prisma.clinic.count({ where: filters }),
    ]);
    const hasMore = rows.length > input.limit;
    const data = rows.slice(0, input.limit).map(toClinic);

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id ?? null : null,
      total,
    };
  }

  async getById(id: string): Promise<Clinic> {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: BigInt(id) },
      include: clinicInclude,
    });
    if (!clinic) throw new AppError('Clinic was not found', 404, 'CLINIC_NOT_FOUND');
    return toClinic(clinic);
  }

  async create(input: ClinicInput): Promise<Clinic> {
    const { doctorIds = [], ...fields } = input;
    return this.prisma.$transaction(async (transaction) => {
      await this.assertDoctorsExist(transaction, doctorIds);
      const clinic = await transaction.clinic.create({
        data: {
          ...newClinicData(fields),
          ...(doctorIds.length
            ? { doctors: { create: doctorIds.map((doctorId) => ({ doctorId: BigInt(doctorId) })) } }
            : {}),
        },
        include: clinicInclude,
      });
      return toClinic(clinic);
    });
  }

  async update(id: string, input: Partial<ClinicInput>): Promise<Clinic> {
    const { doctorIds, ...fields } = input;
    return this.prisma.$transaction(async (transaction) => {
      if (doctorIds !== undefined) {
        await this.assertDoctorsExist(transaction, doctorIds);
        await transaction.clinicDoctor.deleteMany({ where: { clinicId: BigInt(id) } });
      }

      try {
        const clinic = await transaction.clinic.update({
          where: { id: BigInt(id) },
          data: {
            ...clinicData(fields),
            ...(doctorIds !== undefined && doctorIds.length
              ? { doctors: { create: doctorIds.map((doctorId) => ({ doctorId: BigInt(doctorId) })) } }
              : {}),
          },
          include: clinicInclude,
        });
        return toClinic(clinic);
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
          throw new AppError('Clinic was not found', 404, 'CLINIC_NOT_FOUND');
        }
        throw error;
      }
    });
  }

  async deactivate(id: string): Promise<void> {
    try {
      await this.prisma.clinic.update({
        where: { id: BigInt(id) },
        data: { isActive: false },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('Clinic was not found', 404, 'CLINIC_NOT_FOUND');
      }
      throw error;
    }
  }

  private async assertDoctorsExist(
    transaction: Prisma.TransactionClient,
    doctorIds: string[],
  ): Promise<void> {
    if (doctorIds.length === 0) return;
    const count = await transaction.doctor.count({
      where: { id: { in: doctorIds.map((doctorId) => BigInt(doctorId)) } },
    });
    if (count !== doctorIds.length) {
      throw new AppError('One or more doctors were not found', 422, 'DOCTOR_NOT_FOUND');
    }
  }
}
