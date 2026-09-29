import { z } from 'zod';

const clinicIdSchema = z.string().refine((value) => {
  if (!/^[1-9]\d*$/.test(value) || value.length > 19) return false;
  return value.length < 19 || value <= '9223372036854775807';
}, 'Must be a positive 64-bit integer');

const optionalClinicFields = {
  legalName: z.string().trim().max(200).nullable().optional(),
  email: z.email().trim().max(150).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  website: z.url().trim().max(255).nullable().optional(),
  address: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  notes: z.string().trim().max(10_000).nullable().optional(),
  isActive: z.boolean().optional(),
  doctorIds: z.array(clinicIdSchema).max(100).refine(
    (ids) => new Set(ids).size === ids.length,
    'Doctor IDs must be unique',
  ).optional(),
};

export const createClinicSchema = z.object({
  name: z.string().trim().min(1).max(150),
  ...optionalClinicFields,
});

export const updateClinicSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  ...optionalClinicFields,
}).refine((input) => Object.keys(input).length > 0, 'At least one field is required');

export const clinicIdParamsSchema = z.object({ clinicId: clinicIdSchema });

export const listClinicsQuerySchema = z.object({
  search: z.string().trim().max(150).optional(),
  isActive: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: clinicIdSchema.optional(),
});
