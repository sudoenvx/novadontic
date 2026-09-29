import { z } from 'zod';

const positiveBigIntId = z.string().refine((value) => {
  if (!/^[1-9]\d*$/.test(value) || value.length > 19) return false;
  return value.length < 19 || value <= '9223372036854775807';
}, 'Must be a positive 64-bit integer');

const sortOrder = z.number().int().min(0).max(32_767);
const applianceFieldTypes = [
  'text',
  'number',
  'select',
  'multiselect',
  'textarea',
  'date',
  'checkbox',
  'file',
  'image',
] as const;
const fieldType = z.enum(applianceFieldTypes);

const fieldOption = z.object({
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(120),
});

const options = z.array(fieldOption).max(100).refine(
  (items) => new Set(items.map(({ value }) => value)).size === items.length,
  'Option values must be unique',
);

export const applianceTypeIdParamsSchema = z.object({ applianceTypeId: positiveBigIntId });
export const applianceGroupParamsSchema = z.object({
  applianceTypeId: positiveBigIntId,
  groupId: positiveBigIntId,
});
export const applianceFieldParamsSchema = z.object({
  applianceTypeId: positiveBigIntId,
  groupId: positiveBigIntId,
  fieldId: positiveBigIntId,
});

export const listApplianceTypesQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  isActive: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: positiveBigIntId.optional(),
});

export const createApplianceTypeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
  sortOrder: sortOrder.optional(),
});

export const updateApplianceTypeSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
  sortOrder: sortOrder.optional(),
}).refine((input) => Object.keys(input).length > 0, 'At least one field is required');

export const setApplianceTypeActiveSchema = z.object({ isActive: z.boolean() });

export const createApplianceFieldGroupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  sortOrder: sortOrder.optional(),
});

export const updateApplianceFieldGroupSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  sortOrder: sortOrder.optional(),
}).refine((input) => Object.keys(input).length > 0, 'At least one field is required');

const optionalFieldProperties = {
  defaultValue: z.string().max(10_000).nullable().optional(),
  dependsOn: z.string().trim().min(1).max(60).nullable().optional(),
  dependsOnValue: z.string().max(255).nullable().optional(),
  required: z.boolean().optional(),
  sortOrder: sortOrder.optional(),
  helpText: z.string().trim().max(200).nullable().optional(),
};

export const createApplianceFieldSchema = z.object({
  key: z.string().trim().regex(/^[a-z][a-z0-9_]*$/).max(60),
  label: z.string().trim().min(1).max(120),
  type: fieldType,
  ...optionalFieldProperties,
  options: options.default([]),
}).refine(
  (input) => ['select', 'multiselect'].includes(input.type) || input.options.length === 0,
  'Options are only supported for select fields',
);

export const updateApplianceFieldSchema = z.object({
  key: z.string().trim().regex(/^[a-z][a-z0-9_]*$/).max(60).optional(),
  label: z.string().trim().min(1).max(120).optional(),
  type: fieldType.optional(),
  ...optionalFieldProperties,
  options: options.optional(),
}).refine((input) => Object.keys(input).length > 0, 'At least one field is required');
