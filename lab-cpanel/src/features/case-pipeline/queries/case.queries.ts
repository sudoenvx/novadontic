import { useQueryClient } from '@tanstack/react-query'
import {
  useGetQuery,
  useMutationAction,
} from '../../../shared/api/queryHooks'
import {
  createCase,
  getCase,
  getCases,
  updateCase,
  updateCaseStageStatus,
} from '../api/case.api'
import type { CreateCaseRequest, UpdateCaseRequest } from '../api/case.dto'
import type { CasePipelineCase } from '../domain/casePipeline'
import { caseKeys } from './case.keys'

function preserveLocalStageData(
  updatedCase: CasePipelineCase,
  currentCase: CasePipelineCase | undefined,
): CasePipelineCase {
  return {
    ...updatedCase,
    productionSteps: updatedCase.productionSteps.map((step) => {
      const currentStep = currentCase?.productionSteps.find(({ id }) => id === step.id)
      return {
        ...step,
        technicians: currentStep?.technicians ?? step.technicians,
      }
    }),
  }
}

export function useCases(search?: string, enabled = true) {
  return useGetQuery({
    queryKey: caseKeys.list(search),
    queryFn: () => getCases(search),
    enabled,
  })
}

export function useCase(caseNumber: string) {
  return useGetQuery({
    queryKey: caseKeys.detail(caseNumber),
    queryFn: () => getCase(caseNumber),
    enabled: Boolean(caseNumber),
  })
}

export function useCreateCase() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: (input: CreateCaseRequest) => createCase(input),
    onSuccess: (caseItem) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: caseKeys.list() }),
        queryClient.setQueryData(caseKeys.detail(caseItem.id), caseItem),
      ]),
  })
}

export function useUpdateCase() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: ({
      caseNumber,
      input,
    }: {
      caseNumber: string
      input: UpdateCaseRequest
    }) => updateCase(caseNumber, input),
    onSuccess: (caseItem) => {
      const currentCase = queryClient.getQueryData<CasePipelineCase>(
        caseKeys.detail(caseItem.id),
      )
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: caseKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: [...caseKeys.detail(caseItem.id), 'activity'],
        }),
        queryClient.setQueryData(
          caseKeys.detail(caseItem.id),
          preserveLocalStageData(caseItem, currentCase),
        ),
      ])
    },
  })
}

export function useUpdateCaseStageStatus() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: ({
      caseNumber,
      stageId,
      status,
    }: {
      caseNumber: string
      stageId: string
      status: 'active' | 'completed'
    }) => updateCaseStageStatus(caseNumber, stageId, status),
    onSuccess: (caseItem) => {
      const currentCase = queryClient.getQueryData<CasePipelineCase>(
        caseKeys.detail(caseItem.id),
      )
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: caseKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: [...caseKeys.detail(caseItem.id), 'activity'],
        }),
        queryClient.setQueryData(
          caseKeys.detail(caseItem.id),
          preserveLocalStageData(caseItem, currentCase),
        ),
      ])
    },
    onError: (_error, variables) =>
      queryClient.invalidateQueries({ queryKey: caseKeys.detail(variables.caseNumber) }),
  })
}
