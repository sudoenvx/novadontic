import { Boxes, Download, File, FileCode, FileText, Image as ImageIcon, Pencil, Save, Trash2, Upload, X } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

import { Button, buttonVariants } from '../../../../shared/ui/Button'
import { Input } from '../../../../shared/ui/Input'
import { isSupportedModelFile } from '../../../../shared/lib/modelFormats'
import type { CasePipelineFile } from '../../domain/casePipeline'

export type EditingStageFile = {
  stepId: string
  fileId: string
  name: string
}

type StageFilesProps = {
  stepId: string
  files: CasePipelineFile[]
  caseNumberCode: string
  doctorName: string
  editingFile?: EditingStageFile
  onSelectFile: (file: File, stepId: string) => void
  onStartRename: (file: CasePipelineFile) => void
  onRename: (fileId: string) => void
  onCancelRename: () => void
  onDownload: (file: CasePipelineFile) => void
  onDelete: (file: CasePipelineFile) => void
  onRenameChange: (name: string) => void
  canUpload: boolean
  canRename: boolean
  canDownload: boolean
  canDelete: boolean
}

export function StageFiles({
  stepId,
  files,
  caseNumberCode,
  doctorName,
  editingFile,
  onSelectFile,
  onStartRename,
  onRename,
  onCancelRename,
  onDownload,
  onDelete,
  onRenameChange,
  canUpload,
  canRename,
  canDownload,
  canDelete,
}: StageFilesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  return (
    <section className="grid gap-2" aria-label="Stage files">
      <input
        ref={fileInputRef}
        type="file"
        accept=".stl,.obj,.ply,.3mf,.pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tif,.tiff,.doc,.docx,.txt,.rtf,.xls,.xlsx,.csv"
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0]
          if (file) onSelectFile(file, stepId)
          event.currentTarget.value = ''
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <FileCode size={13} className="text-primary" />
          <span className="text-xs font-semibold text-text-primary">Stage files ({files.length})</span>
        </div>
        {canUpload && (
          <Button size="xs" variant="outline" onClick={openFilePicker}>
            <Upload size={12} />
            <span>Add file</span>
          </Button>
        )}
      </div>

      {files.length ? (
        <div className="grid gap-1.5">
          {files.map((file) => {
            const isEditing = editingFile?.stepId === stepId && editingFile.fileId === file.id
            const canPreviewModel = isSupportedModelFile(file.name)
            return (
              <div
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-1.5 transition-colors hover:bg-surface-soft"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <FileTypeIcon type={file.type} />
                  <div className="min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          size="sm"
                          aria-label={`Rename ${file.name}`}
                          value={editingFile.name}
                          onChange={(event) => onRenameChange(event.currentTarget.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              onRename(file.id)
                            }
                            if (event.key === 'Escape') onCancelRename()
                          }}
                          autoFocus
                        />
                        {canRename && (
                          <Button size="icon-sm" variant="ghost" aria-label="Save file name" onClick={() => onRename(file.id)}>
                            <Save />
                          </Button>
                        )}
                        <Button size="icon-sm" variant="ghost" aria-label="Cancel rename" onClick={onCancelRename}>
                          <X />
                        </Button>
                      </div>
                    ) : canPreviewModel && canDownload ? (
                      <Link
                        to={getModelViewerHref(file, caseNumberCode, doctorName)}
                        className="block truncate text-sm font-medium text-primary hover:underline"
                        aria-label={`View ${file.name} in 3D model viewer`}
                      >
                        {file.name}
                      </Link>
                    ) : (
                      <p className="truncate text-sm font-medium text-text-primary">{file.name}</p>
                    )}
                    <p className="text-xs text-text-muted">
                      {file.type} · {file.size} · {file.uploadedBy} · {file.uploadedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {canPreviewModel && canDownload && !isEditing && (
                    <Link
                      to={getModelViewerHref(file, caseNumberCode, doctorName)}
                      className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                      aria-label={`Open ${file.name} in 3D model viewer`}
                      title="View 3D model"
                    >
                      <Boxes />
                    </Link>
                  )}
                  {canRename && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onStartRename(file)}
                      title={`Rename ${file.name}`}
                      aria-label={`Rename ${file.name}`}
                    >
                      <Pencil />
                    </Button>
                  )}
                  {canDownload && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onDownload(file)}
                      title={`Download ${file.name}`}
                      aria-label={`Download ${file.name}`}
                    >
                      <Download />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onDelete(file)}
                      className="text-destructive hover:bg-destructive-soft hover:text-destructive"
                      title={`Delete ${file.name}`}
                      aria-label={`Delete ${file.name}`}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state grid justify-items-center gap-1.5 py-4">
          <p className="text-sm">No files uploaded for this stage yet.</p>
          {canUpload && (
            <Button
              size="xs"
              variant="ghost"
              onClick={openFilePicker}
              className="h-auto rounded-sm px-2 py-0.5 text-primary hover:bg-primary-soft hover:text-primary-soft-foreground"
            >
              <Upload size={12} />
              <span>Upload CAD, scan or document</span>
            </Button>
          )}
        </div>
      )}
    </section>
  )
}

function getModelViewerHref(
  file: CasePipelineFile,
  caseNumberCode: string,
  doctorName: string,
) {
  const searchParams = new URLSearchParams({
    fileId: file.id,
    fileName: file.name,
    caseNumber: caseNumberCode,
    doctorName,
  })
  return `/model-viewer?${searchParams.toString()}`
}

function FileTypeIcon({ type }: { type: CasePipelineFile['type'] }) {
  const className = 'shrink-0'
  switch (type) {
    case 'STL':
      return <Boxes size={14} className={`text-primary ${className}`} />
    case 'IMG':
      return <ImageIcon size={14} className={`text-accent ${className}`} />
    case 'PDF':
      return <FileText size={14} className={`text-destructive ${className}`} />
    case 'DOC':
      return <FileCode size={14} className={`text-text-secondary ${className}`} />
    case 'OTHER':
      return <File size={14} className={`text-text-muted ${className}`} />
  }
}
