import { z } from 'zod';

const roleIdSchema = z.string().refine((value) => {
  if (!/^[1-9]\d*$/.test(value) || value.length > 19) return false;
  return value.length < 19 || value <= '9223372036854775807';
}, 'Must be a positive 64-bit integer');
const permissionCodeSchema = z.string().trim().min(1).max(100);

export const roleIdParamsSchema = z.object({ roleId: roleIdSchema });

export const listRolesQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
});

export const listPermissionsQuerySchema = z.object({
  module: z.string().trim().min(1).max(40).optional(),
});

export const createRoleSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(2_000),
});

export const updateRoleSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().min(1).max(2_000).optional(),
}).refine((input) => Object.keys(input).length > 0, 'At least one field is required');

export const setRolePermissionsSchema = z.object({
  permissionCodes: z.array(permissionCodeSchema).max(200).refine(
    (codes) => new Set(codes).size === codes.length,
    'Permission codes must be unique',
  ),
});
