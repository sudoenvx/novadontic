import {
  Download,
  FileBox,
  FileCode,
  FileText,
  Image as ImageIcon,
  Pencil,
  Trash2,
  Upload,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { isSupportedModelFile } from '../../../../shared/lib/modelFormats'
import { Button } from '../../../../shared/ui/Button'
import { Card, CardHeader, CardTitle } from '../../../../shared/ui/Card'
import {
  FilterTab,
  FilterTabs,
  FilterTabsList,
} from '../../../../shared/ui/FilterTabs'
import { Input } from '../../../../shared/ui/Input'
import { Skeleton } from '../../../../shared/ui/Skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../shared/ui/Table'
import type { CasePipelineFile } from '../../domain/casePipeline'

type FileFilter = 'all' | 'model' | 'image' | 'document'

type CasePipelineFilesProps = {
  caseNumber: string
  files: CasePipelineFile[]
  isLoading: boolean
  error?: string
  isUploading: boolean
  isRenaming: boolean
  isDeleting: boolean
  canUpload: boolean
  canRename: boolean
  canDownload: boolean
  canDelete: boolean
  onUpload: (file: File) => Promise<boolean>
  onRename: (fileId: string, name: string) => Promise<boolean>
  onDelete: (file: CasePipelineFile) => Promise<boolean>
  onDownload: (file: CasePipelineFile) => Promise<void>
}

const fileFilters: Array<{ value: FileFilter; label: string }> = [
  { value: 'all', label: 'All files' },
  { value: 'model', label: 'Models' },
  { value: 'image', label: 'Images' },
  { value: 'document', label: 'Documents' },
]

export function CasePipelineFiles({
  caseNumber,
  files,
  isLoading,
  error,
  isUploading,
  isRenaming,
  isDeleting,
  canUpload,
  canRename,
  canDownload,
  canDelete,
  onUpload,
  onRename,
  onDelete,
  onDownload,
}: CasePipelineFilesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [filter, setFilter] = useState<FileFilter>('all')
  const [editingFileId, setEditingFileId] = useState<string>()
  const [editingName, setEditingName] = useState('')
  const filteredFiles = useMemo(
    () => files.filter((file) => filter === 'all' || file.kind === filter),
    [files, filter],
  )

  async function saveName(fileId: string) {
    if (!editingName.trim()) return
    if (await onRename(fileId, editingName.trim())) {
      setEditingFileId(undefined)
      setEditingName('')
    }
  }

  return (
    <Card size="sm">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Files</CardTitle>
            <p className="mt-1 text-sm text-text-muted">
              Every scan, setup, and production file for this case.
            </p>
          </div>
          {canUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".stl,.obj,.ply,.3mf,.pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tif,.tiff,.doc,.docx,.txt,.rtf,.xls,.xlsx,.csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0]
                  if (file) void onUpload(file)
                  event.currentTarget.value = ''
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload aria-hidden="true" />
                {isUploading ? 'Uploading…' : 'Upload file'}
              </Button>
            </>
          )}
        </div>
        <FilterTabs
          value={filter}
          onValueChange={(value) => {
            if (isFileFilter(value)) setFilter(value)
          }}
          aria-label="Filter case files"
        >
          <FilterTabsList>
            {fileFilters.map(({ value, label }) => (
              <FilterTab key={value} value={value}>{label}</FilterTab>
            ))}
          </FilterTabsList>
        </FilterTabs>
      </CardHeader>

      {error ? (
        <p role="alert" className="px-3 py-8 text-center text-sm text-destructive">
          {error}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border-subtle">
                <TableHead>File</TableHead>
                <TableHead>Production stage</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }, (_, index) => (
                  <TableRow key={index} className="border-b border-border-subtle">
                    <TableCell colSpan={5}>
                      <Skeleton className="h-5 w-full max-w-2xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredFiles.length ? (
                filteredFiles.map((file) => (
                  <TableRow key={file.id} className="border-b border-border-subtle last:border-b-0">
                    <TableCell>
                      <div className="flex min-w-56 items-center gap-2">
                        <FileTypeIcon type={file.type} />
                        {editingFileId === file.id ? (
                          <div className="flex min-w-0 items-center gap-1">
                            <Input
                              size="sm"
                              aria-label={`Rename ${file.name}`}
                              value={editingName}
                              onChange={(event) => setEditingName(event.currentTarget.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault()
                                  void saveName(file.id)
                                }
                                if (event.key === 'Escape') setEditingFileId(undefined)
                              }}
                              autoFocus
                            />
                            <Button
                              size="xs"
                              variant="outline"
                              disabled={isRenaming}
                              onClick={() => void saveName(file.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => setEditingFileId(undefined)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : isSupportedModelFile(file.name) ? (
                          <Link
                            to={getModelViewerHref(file, caseNumber)}
                            className="truncate text-sm font-medium text-primary hover:underline"
                          >
                            {file.name}
                          </Link>
                        ) : (
                          <span className="truncate text-sm font-medium text-text-primary">
                            {file.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">
                      {file.stageName ?? 'Case files'}
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">
                      <span>{file.uploadedBy}</span>
                      <span className="ml-1 text-xs text-text-muted">· {file.uploadedAt}</span>
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">{file.size}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-0.5">
                        {canRename && (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Rename ${file.name}`}
                            disabled={isRenaming || isDeleting}
                            onClick={() => {
                              setEditingFileId(file.id)
                              setEditingName(file.name)
                            }}
                          >
                            <Pencil />
                          </Button>
                        )}
                        {canDownload && (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Download ${file.name}`}
                            onClick={() => void onDownload(file)}
                          >
                            <Download />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Delete ${file.name}`}
                            disabled={isDeleting || isRenaming}
                            className="text-destructive hover:bg-destructive-soft hover:text-destructive"
                            onClick={() => void onDelete(file)}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-text-muted">
                    {files.length
                      ? 'There are no files in this category.'
                      : 'No files have been uploaded to this case yet.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  )
}

function isFileFilter(value: string): value is FileFilter {
  return fileFilters.some((filterOption) => filterOption.value === value)
}

function getModelViewerHref(file: CasePipelineFile, caseNumber: string) {
  const searchParams = new URLSearchParams({
    fileId: file.id,
    fileName: file.name,
    caseNumber,
  })
  return `/model-viewer?${searchParams.toString()}`
}

function FileTypeIcon({ type }: { type: CasePipelineFile['type'] }) {
  const className = 'size-4 shrink-0'
  switch (type) {
    case 'STL':
      return <FileBox className={`${className} text-primary`} aria-hidden="true" />
    case 'IMG':
      return <ImageIcon className={`${className} text-accent`} aria-hidden="true" />
    case 'PDF':
      return <FileText className={`${className} text-destructive`} aria-hidden="true" />
    case 'DOC':
      return <FileCode className={`${className} text-text-secondary`} aria-hidden="true" />
    case 'OTHER':
      return <FileBox className={`${className} text-text-muted`} aria-hidden="true" />
  }
}
