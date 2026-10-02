import { z } from 'zod';
import { workflowFileKinds } from './workflows.domain.ts';

const positiveBigIntId = z.string().refine((value) => {
  if (!/^[1-9]\d*$/.test(value) || value.length > 19) return false;
  return value.length < 19 || value <= '9223372036854775807';
}, 'Must be a positive 64-bit integer');

const fileKind = z.enum(workflowFileKinds);
const stageProperties = {
  name: z.string().trim().min(1).max(80),
  slaHours: z.number().int().positive().nullable(),
  requiresApproval: z.boolean(),
  allowedFileKinds: z.array(fileKind).max(workflowFileKinds.length).refine(
    (kinds) => new Set(kinds).size === kinds.length,
    'File kinds must be unique',
  ),
};

export const workflowIdParamsSchema = z.object({ workflowId: positiveBigIntId });
export const workflowStageParamsSchema = z.object({
  workflowId: positiveBigIntId,
  stageId: positiveBigIntId,
});

export const listWorkflowsQuerySchema = z.object({
  applianceTypeId: positiveBigIntId.optional(),
});

export const createWorkflowSchema = z.object({
  applianceTypeId: positiveBigIntId.nullable(),
  name: z.string().trim().min(1).max(100),
  isDefault: z.boolean().default(false),
});

export const updateWorkflowSchema = z.object({
  applianceTypeId: positiveBigIntId.nullable().optional(),
  name: z.string().trim().min(1).max(100).optional(),
  isDefault: z.boolean().optional(),
}).refine((input) => Object.keys(input).length > 0, 'At least one field is required');

export const createWorkflowStageSchema = z.object({
  ...stageProperties,
  slaHours: stageProperties.slaHours.default(null),
  requiresApproval: stageProperties.requiresApproval.default(false),
  allowedFileKinds: stageProperties.allowedFileKinds.default([...workflowFileKinds]),
});

export const updateWorkflowStageSchema = z.object({
  name: stageProperties.name.optional(),
  slaHours: stageProperties.slaHours.optional(),
  requiresApproval: stageProperties.requiresApproval.optional(),
  allowedFileKinds: stageProperties.allowedFileKinds.optional(),
}).refine((input) => Object.keys(input).length > 0, 'At least one field is required');

export const reorderWorkflowStagesSchema = z.object({
  stageIds: z.array(positiveBigIntId).max(32_768).refine(
    (ids) => new Set(ids).size === ids.length,
    'Stage ids must be unique',
  ),
});
