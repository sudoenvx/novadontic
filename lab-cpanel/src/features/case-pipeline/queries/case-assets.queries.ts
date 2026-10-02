import { useQueryClient } from '@tanstack/react-query'
import { useGetQuery, useMutationAction } from '../../../shared/api/queryHooks'
import {
  addCaseComment,
  deleteCaseFile,
  getCaseActivity,
  getCaseFiles,
  renameCaseFile,
  uploadCaseFile,
} from '../api/case-assets.api'
import { caseKeys } from './case.keys'

const caseAssetKeys = {
  files: (caseNumber: string) => [...caseKeys.detail(caseNumber), 'files'] as const,
  activity: (caseNumber: string) => [...caseKeys.detail(caseNumber), 'activity'] as const,
}

export function useCaseFiles(caseNumber: string, canView = true) {
  return useGetQuery({
    queryKey: caseAssetKeys.files(caseNumber),
    queryFn: () => getCaseFiles(caseNumber),
    enabled: Boolean(caseNumber) && canView,
  })
}

export function useCaseActivity(caseNumber: string, canView = true) {
  return useGetQuery({
    queryKey: caseAssetKeys.activity(caseNumber),
    queryFn: () => getCaseActivity(caseNumber),
    enabled: Boolean(caseNumber) && canView,
  })
}

export function useUploadCaseFile() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: ({
      caseNumber,
      file,
      stageId,
    }: {
      caseNumber: string
      file: File
      stageId?: string
    }) => uploadCaseFile(caseNumber, file, stageId),
    onSuccess: (_file, variables) => Promise.all([
      queryClient.invalidateQueries({ queryKey: caseAssetKeys.files(variables.caseNumber) }),
      queryClient.invalidateQueries({ queryKey: caseAssetKeys.activity(variables.caseNumber) }),
    ]),
  })
}

export function useRenameCaseFile() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: ({
      caseNumber,
      fileId,
      name,
    }: {
      caseNumber: string
      fileId: string
      name: string
    }) => renameCaseFile(caseNumber, fileId, name),
    onSuccess: (_file, variables) => Promise.all([
      queryClient.invalidateQueries({ queryKey: caseAssetKeys.files(variables.caseNumber) }),
      queryClient.invalidateQueries({ queryKey: caseAssetKeys.activity(variables.caseNumber) }),
    ]),
  })
}

export function useDeleteCaseFile() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: ({
      caseNumber,
      fileId,
    }: {
      caseNumber: string
      fileId: string
    }) => deleteCaseFile(caseNumber, fileId),
    onSuccess: (_result, variables) => Promise.all([
      queryClient.invalidateQueries({ queryKey: caseAssetKeys.files(variables.caseNumber) }),
      queryClient.invalidateQueries({ queryKey: caseAssetKeys.activity(variables.caseNumber) }),
    ]),
  })
}

export function useAddCaseComment() {
  const queryClient = useQueryClient()
  return useMutationAction({
    mutationFn: ({
      caseNumber,
      message,
    }: {
      caseNumber: string
      message: string
    }) => addCaseComment(caseNumber, message),
    onSuccess: (_entry, variables) =>
      queryClient.invalidateQueries({
        queryKey: caseAssetKeys.activity(variables.caseNumber),
      }),
  })
}
