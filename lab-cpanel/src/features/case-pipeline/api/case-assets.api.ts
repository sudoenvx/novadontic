import { httpClient } from '../../../shared/api/httpClient'
import type { CasePipelineFile, CaseActivityItem } from '../domain/casePipeline'
import {
  caseFileResponseEnvelopeDtoSchema,
  caseFilesResponseDtoSchema,
  caseTimelineEntryResponseEnvelopeDtoSchema,
  caseTimelineResponseDtoSchema,
  type CaseFileResponseDto,
  type CaseTimelineEntryResponseDto,
} from './case-assets.dto'

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileType(file: CaseFileResponseDto): CasePipelineFile['type'] {
  if (file.kind === 'model') return 'STL'
  if (file.kind === 'image') return 'IMG'
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension === 'pdf') return 'PDF'
  if (['doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'csv'].includes(extension ?? '')) {
    return 'DOC'
  }
  return 'OTHER'
}

function mapCaseFile(file: CaseFileResponseDto): CasePipelineFile {
  return {
    id: file.id,
    name: file.name,
    type: getFileType(file),
    size: formatFileSize(file.sizeBytes),
    uploadedBy: file.uploadedBy,
    uploadedAt: new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
    }).format(new Date(file.createdAt)),
    kind: file.kind,
    stageId: file.stageId,
    stageName: file.stageName,
    sizeBytes: file.sizeBytes,
  }
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function mapTimelineEntry(entry: CaseTimelineEntryResponseDto): CaseActivityItem {
  return {
    id: entry.id,
    author: entry.author,
    initials: getInitials(entry.author),
    message: entry.message,
    createdAt: entry.createdAt,
    isSystem: entry.kind === 'event',
  }
}

export async function getCaseFiles(caseNumber: string) {
  const response = await httpClient.get(
    `/cases/${encodeURIComponent(caseNumber)}/files`,
  )
  return caseFilesResponseDtoSchema.parse(response.data).data.map(mapCaseFile)
}

export async function uploadCaseFile(
  caseNumber: string,
  file: File,
  stageId?: string,
) {
  const payload = new FormData()
  payload.append('file', file)
  if (stageId) payload.append('stageId', stageId)
  const response = await httpClient.post(
    `/cases/${encodeURIComponent(caseNumber)}/files`,
    payload,
  )
  const parsed = caseFileResponseEnvelopeDtoSchema.parse(response.data)
  return mapCaseFile(parsed.data)
}

export async function renameCaseFile(
  caseNumber: string,
  fileId: string,
  name: string,
) {
  const response = await httpClient.patch(
    `/cases/${encodeURIComponent(caseNumber)}/files/${encodeURIComponent(fileId)}`,
    { name },
  )
  const parsed = caseFileResponseEnvelopeDtoSchema.parse(response.data)
  return mapCaseFile(parsed.data)
}

export async function deleteCaseFile(caseNumber: string, fileId: string) {
  await httpClient.delete(
    `/cases/${encodeURIComponent(caseNumber)}/files/${encodeURIComponent(fileId)}`,
  )
}

export async function downloadCaseFile(caseNumber: string, fileId: string) {
  const response = await httpClient.get<Blob>(
    `/cases/${encodeURIComponent(caseNumber)}/files/${encodeURIComponent(fileId)}/download`,
    { responseType: 'blob' },
  )
  return response.data
}

export async function getCaseActivity(caseNumber: string) {
  const response = await httpClient.get(
    `/cases/${encodeURIComponent(caseNumber)}/activity`,
  )
  return caseTimelineResponseDtoSchema.parse(response.data).data.map(mapTimelineEntry)
}

export async function addCaseComment(caseNumber: string, message: string) {
  const response = await httpClient.post(
    `/cases/${encodeURIComponent(caseNumber)}/activity`,
    { message },
  )
  const parsed = caseTimelineEntryResponseEnvelopeDtoSchema.parse(response.data)
  return mapTimelineEntry(parsed.data)
}
