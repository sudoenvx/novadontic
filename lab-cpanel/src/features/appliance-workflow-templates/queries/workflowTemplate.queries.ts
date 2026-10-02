import { useQueryClient } from '@tanstack/react-query'
import { useGetQuery, useMutationAction } from '../../../shared/api/queryHooks'
import {
  createWorkflowStage,
  createWorkflowTemplate,
  deleteWorkflowStage,
  getWorkflowTemplateOptions,
  getWorkflowTemplates,
  reorderWorkflowStages,
  updateWorkflowStage,
  updateWorkflowTemplate,
} from '../api/workflowTemplate.api'
import type {
  WorkflowStageInput,
  WorkflowTemplateInput,
  WorkflowTemplateUpdateInput,
} from '../domain/workflowTemplate'
import { workflowTemplateKeys } from './workflowTemplate.keys'

export function useWorkflowTemplates() {
  return useGetQuery({
    queryKey: workflowTemplateKeys.list(),
    queryFn: getWorkflowTemplates,
  })
}

export function useWorkflowTemplateOptions() {
  return useGetQuery({
    queryKey: workflowTemplateKeys.options(),
    queryFn: getWorkflowTemplateOptions,
  })
}

function useInvalidateWorkflowTemplates() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({
    queryKey: workflowTemplateKeys.all,
  })
}

export function useCreateWorkflowTemplate() {
  const invalidate = useInvalidateWorkflowTemplates()
  return useMutationAction({
    mutationFn: (input: WorkflowTemplateInput) => createWorkflowTemplate(input),
    onSuccess: invalidate,
  })
}

export function useUpdateWorkflowTemplate() {
  const invalidate = useInvalidateWorkflowTemplates()
  return useMutationAction({
    mutationFn: ({
      workflowId,
      input,
    }: {
      workflowId: string
      input: WorkflowTemplateUpdateInput
    }) => updateWorkflowTemplate(workflowId, input),
    onSuccess: invalidate,
  })
}

export function useCreateWorkflowStage() {
  const invalidate = useInvalidateWorkflowTemplates()
  return useMutationAction({
    mutationFn: ({
      workflowId,
      input,
    }: {
      workflowId: string
      input: WorkflowStageInput
    }) => createWorkflowStage(workflowId, input),
    onSuccess: invalidate,
  })
}

export function useUpdateWorkflowStage() {
  const invalidate = useInvalidateWorkflowTemplates()
  return useMutationAction({
    mutationFn: ({
      workflowId,
      stageId,
      input,
    }: {
      workflowId: string
      stageId: string
      input: WorkflowStageInput
    }) => updateWorkflowStage(workflowId, stageId, input),
    onSuccess: invalidate,
  })
}

export function useDeleteWorkflowStage() {
  const invalidate = useInvalidateWorkflowTemplates()
  return useMutationAction({
    mutationFn: ({
      workflowId,
      stageId,
    }: {
      workflowId: string
      stageId: string
    }) => deleteWorkflowStage(workflowId, stageId),
    onSuccess: invalidate,
  })
}

export function useReorderWorkflowStages() {
  const invalidate = useInvalidateWorkflowTemplates()
  return useMutationAction({
    mutationFn: ({
      workflowId,
      stageIds,
    }: {
      workflowId: string
      stageIds: string[]
    }) => reorderWorkflowStages(workflowId, stageIds),
    onSuccess: invalidate,
  })
}
