import { z } from 'zod';

const positiveBigIntId = z.string().refine((value) => {
  if (!/^[1-9]\d*$/.test(value) || value.length > 19) return false;
  return value.length < 19 || value <= '9223372036854775807';
}, 'Must be a positive 64-bit integer');

const roleIds = z.array(positiveBigIntId).min(1).max(100).refine(
  (ids) => new Set(ids).size === ids.length,
  'Role IDs must be unique',
);

const staffProfile = {
  fullName: z.string().trim().min(1).max(150),
  email: z.email().trim().toLowerCase().max(150),
  phone: z.string().trim().max(30).nullable().optional(),
};

export const staffIdParamsSchema = z.object({ staffId: positiveBigIntId });

export const listStaffQuerySchema = z.object({
  search: z.string().trim().max(150).optional(),
  isActive: z.union([z.enum(['true', 'false']), z.boolean()])
    .transform((value) => value === 'true' || value === true)
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: positiveBigIntId.optional(),
});

export const createStaffSchema = z.object({
  ...staffProfile,
  password: z.string().min(12).max(128),
  roleIds,
});

export const updateStaffSchema = z.object({
  fullName: staffProfile.fullName.optional(),
  email: staffProfile.email.optional(),
  phone: staffProfile.phone,
  roleIds: roleIds.optional(),
}).refine((input) => Object.keys(input).length > 0, 'At least one field is required');

export const setStaffActiveSchema = z.object({ isActive: z.boolean() });
