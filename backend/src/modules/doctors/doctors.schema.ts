import { z } from 'zod';

const positiveBigIntId = z.string().refine((value) => {
  if (!/^[1-9]\d*$/.test(value) || value.length > 19) return false;
  return value.length < 19 || value <= '9223372036854775807';
}, 'Must be a positive 64-bit integer');

const optionalDoctorFields = {
  email: z.email().trim().max(150).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  address: z.string().trim().max(255).nullable().optional(),
  country: z.string().trim().max(100).nullable().optional(),
  specialty: z.string().trim().max(100).nullable().optional(),
  notes: z.string().trim().max(10_000).nullable().optional(),
  source: z.enum(['clinic', 'portal']).optional(),
  isActive: z.boolean().optional(),
  clinicIds: z.array(positiveBigIntId).max(100).refine(
    (ids) => new Set(ids).size === ids.length,
    'Clinic IDs must be unique',
  ).optional(),
};

export const doctorIdParamsSchema = z.object({ doctorId: positiveBigIntId });

export const createDoctorSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  ...optionalDoctorFields,
});

export const updateDoctorSchema = z.object({
  fullName: z.string().trim().min(1).max(100).optional(),
  ...optionalDoctorFields,
}).refine((input) => Object.keys(input).length > 0, 'At least one field is required');

export const listDoctorsQuerySchema = z.object({
  search: z.string().trim().max(150).optional(),
  isActive: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  clinicId: positiveBigIntId.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: positiveBigIntId.optional(),
});
