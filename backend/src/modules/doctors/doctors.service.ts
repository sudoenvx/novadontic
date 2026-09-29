import type { Prisma, PrismaClient } from '../../generated/prisma/client.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import type {
  Doctor,
  DoctorInput,
  DoctorListInput,
  DoctorListResult,
  DoctorUpdateInput,
  DoctorsServiceContract,
} from './doctors.domain.ts';

const doctorInclude = {
  clinics: {
    include: { clinic: { select: { id: true, name: true } } },
    orderBy: { clinicId: 'asc' },
  },
} satisfies Prisma.DoctorInclude;

type DoctorRow = Prisma.DoctorGetPayload<{ include: typeof doctorInclude }>;

function toDoctor(row: DoctorRow): Doctor {
  return {
    id: row.id.toString(),
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    address: row.address,
    country: row.country,
    specialty: row.specialty,
    notes: row.notes,
    source: row.source === 'portal' ? 'portal' : 'clinic',
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    clinics: row.clinics.map(({ clinic }) => ({
      id: clinic.id.toString(),
      name: clinic.name,
    })),
  };
}

function isPrismaError(error: unknown, code: string): boolean {
  return error instanceof Error && 'code' in error && error.code === code;
}

function doctorNotFound(): AppError {
  return new AppError('Doctor was not found', 404, 'DOCTOR_NOT_FOUND');
}

function doctorData(input: DoctorInput | DoctorUpdateInput): Prisma.DoctorUpdateInput {
  return {
    ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.address !== undefined ? { address: input.address } : {}),
    ...(input.country !== undefined ? { country: input.country } : {}),
    ...(input.specialty !== undefined ? { specialty: input.specialty } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.source !== undefined ? { source: input.source } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
  };
}

function doctorCreateData(input: DoctorInput): Prisma.DoctorCreateInput {
  return {
    fullName: input.fullName,
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.address !== undefined ? { address: input.address } : {}),
    ...(input.country !== undefined ? { country: input.country } : {}),
    ...(input.specialty !== undefined ? { specialty: input.specialty } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.source !== undefined ? { source: input.source } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
  };
}

export class DoctorsService implements DoctorsServiceContract {
  constructor(private readonly prisma: PrismaClient) {}

  async list(input: DoctorListInput): Promise<DoctorListResult> {
    const filters: Prisma.DoctorWhereInput = {
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.clinicId
        ? { clinics: { some: { clinicId: BigInt(input.clinicId) } } }
        : {}),
      ...(input.search
        ? {
            OR: [
              { fullName: { contains: input.search } },
              { email: { contains: input.search } },
              { phone: { contains: input.search } },
              { specialty: { contains: input.search } },
            ],
          }
        : {}),
    };
    const where: Prisma.DoctorWhereInput = {
      ...filters,
      ...(input.cursor ? { id: { gt: BigInt(input.cursor) } } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        include: doctorInclude,
        orderBy: { id: 'asc' },
        take: input.limit + 1,
      }),
      this.prisma.doctor.count({ where: filters }),
    ]);
    const hasMore = rows.length > input.limit;
    const data = rows.slice(0, input.limit).map(toDoctor);
    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id ?? null : null,
      total,
    };
  }

  async getById(id: string): Promise<Doctor> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: BigInt(id) },
      include: doctorInclude,
    });
    if (!doctor) throw doctorNotFound();
    return toDoctor(doctor);
  }

  async create(input: DoctorInput): Promise<Doctor> {
    const clinicIds = input.clinicIds ?? [];
    this.assertSourceClinicCompatibility(input.source ?? 'clinic', clinicIds);

    try {
      const doctor = await this.prisma.$transaction(async (transaction) => {
        await this.assertClinicsExist(transaction, clinicIds);
        return transaction.doctor.create({
          data: {
            ...doctorCreateData(input),
            ...(clinicIds.length
              ? {
                  clinics: {
                    create: clinicIds.map((clinicId) => ({ clinicId: BigInt(clinicId) })),
                  },
                }
              : {}),
          },
          include: doctorInclude,
        });
      });
      return toDoctor(doctor);
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new AppError('A doctor with this email already exists', 409, 'DOCTOR_EMAIL_EXISTS');
      }
      throw error;
    }
  }

  async update(id: string, input: DoctorUpdateInput): Promise<Doctor> {
    try {
      const doctor = await this.prisma.$transaction(async (transaction) => {
        const existing = await transaction.doctor.findUnique({
          where: { id: BigInt(id) },
          select: { source: true },
        });
        if (!existing) throw doctorNotFound();

        const source = input.source ?? existing.source;
        const clinicIds = input.clinicIds ?? (source === 'portal' ? [] : undefined);
        if (clinicIds !== undefined) {
          this.assertSourceClinicCompatibility(source, clinicIds);
          await this.assertClinicsExist(transaction, clinicIds);
          await transaction.clinicDoctor.deleteMany({ where: { doctorId: BigInt(id) } });
        }
        return transaction.doctor.update({
          where: { id: BigInt(id) },
          data: {
            ...doctorData(input),
            ...(clinicIds?.length
              ? {
                  clinics: {
                    create: clinicIds.map((clinicId) => ({ clinicId: BigInt(clinicId) })),
                  },
                }
              : {}),
          },
          include: doctorInclude,
        });
      });
      return toDoctor(doctor);
    } catch (error) {
      if (isPrismaError(error, 'P2025')) throw doctorNotFound();
      if (isPrismaError(error, 'P2002')) {
        throw new AppError('A doctor with this email already exists', 409, 'DOCTOR_EMAIL_EXISTS');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.doctor.delete({ where: { id: BigInt(id) } });
    } catch (error) {
      if (isPrismaError(error, 'P2025')) throw doctorNotFound();
      throw error;
    }
  }

  private assertSourceClinicCompatibility(
    source: string,
    clinicIds: string[],
  ): void {
    if (source === 'portal' && clinicIds.length > 0) {
      throw new AppError('Portal doctors cannot be linked to clinics', 422, 'PORTAL_DOCTOR_HAS_CLINIC');
    }
  }

  private async assertClinicsExist(
    transaction: Prisma.TransactionClient,
    clinicIds: string[],
  ): Promise<void> {
    if (clinicIds.length === 0) return;
    const count = await transaction.clinic.count({
      where: { id: { in: clinicIds.map((clinicId) => BigInt(clinicId)) } },
    });
    if (count !== clinicIds.length) {
      throw new AppError('One or more clinics were not found', 422, 'CLINIC_NOT_FOUND');
    }
  }
}
