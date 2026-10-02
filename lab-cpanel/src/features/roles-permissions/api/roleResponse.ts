import { z } from 'zod'

const roleIdSchema = z.string().regex(/^[1-9]\d{0,18}$/).refine(
  (value) => value.length < 19 || value <= '9223372036854775807',
)

export const roleResponseSchema = z.object({
  id: roleIdSchema,
  code: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['owner', 'system', 'custom']),
  isSystem: z.boolean(),
  staffCount: z.number().int().nonnegative(),
  permissions: z.array(z.string()),
})

export const roleEnvelopeSchema = z.object({
  data: roleResponseSchema,
})

export const roleListEnvelopeSchema = z.object({
  data: z.array(roleResponseSchema),
})

export const rolePermissionSchema = z.object({
  code: z.string(),
  module: z.string(),
  description: z.string().nullable(),
})

export const rolePermissionsEnvelopeSchema = z.object({
  data: z.array(rolePermissionSchema),
})

export const roleInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(2000),
})

export const roleUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().min(1).max(2000).optional(),
}).refine((input) => Object.keys(input).length > 0)

export const setRolePermissionsSchema = z.object({
  permissionCodes: z.array(z.string().trim().min(1).max(100)).max(200)
    .refine((codes) => new Set(codes).size === codes.length),
})

export type RoleResponse = z.infer<typeof roleResponseSchema>
export type RolePermissionResponse = z.infer<typeof rolePermissionSchema>
