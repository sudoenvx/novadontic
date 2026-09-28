import { useEffect, useId, useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, ImagePlus, Loader2, RotateCcw, Trash2, ZoomIn } from 'lucide-react'

import { formatBytes, makeId } from '../lib/file/fileHelpers'
import { Button } from './Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './Dialog'
import { cn } from 'cn'

export type ImageStatus = 'loading' | 'ready' | 'error'

export interface PickedImage {
  id: string
  file: File
  /** Local object URL — always available immediately for a preview. */
  previewUrl: string
  sizeBytes: number
  status: ImageStatus
  error?: string
  /** Set once uploadFn resolves, if you provide one. */
  remoteUrl?: string
}

export interface ImagePickerProps {
  maxFiles?: number
  maxSizeMB?: number
  disabled?: boolean
  /** Label on the "add" tile and the hidden input's accessible name. */
  label?: string
  helperText?: string
  /** Provide to actually upload (e.g. to storage). Omit to keep local previews only. */
  uploadFn?: (file: File) => Promise<{ url: string }>
  onChange?: (images: PickedImage[]) => void
  className?: string
}

export default function ImagePicker({
  maxFiles = 12,
  maxSizeMB = 15,
  disabled = false,
  label = 'Add photos',
  helperText,
  uploadFn,
  onChange,
  className = '',
}: ImagePickerProps) {
  const [images, setImages] = useState<PickedImage[]>([])
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const imagesRef = useRef<PickedImage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const safeMaxFiles = Math.max(0, maxFiles)
  const previewImage = previewIndex === null ? null : images[previewIndex] ?? null

  useEffect(() => () => {
    imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    imagesRef.current = []
  }, [])

  function updateImages(update: (current: PickedImage[]) => PickedImage[]) {
    const current = imagesRef.current
    const next = update(current)
    if (next === current) return

    imagesRef.current = next
    setImages(next)
    onChange?.(next)
  }

  async function uploadImage(image: PickedImage) {
    if (!uploadFn) return

    try {
      const result = await uploadFn(image.file)
      updateImages((current) => {
        if (!current.some((item) => item.id === image.id)) return current
        return current.map((item) => item.id === image.id
          ? { ...item, status: 'ready', remoteUrl: result.url, error: undefined }
          : item)
      })
    } catch (error) {
      updateImages((current) => {
        if (!current.some((item) => item.id === image.id)) return current
        return current.map((item) => item.id === image.id
          ? {
              ...item,
              status: 'error',
              error: error instanceof Error ? error.message : 'Upload failed',
            }
          : item)
      })
    }
  }

  function addFiles(fileList: FileList | File[]) {
    setErrorMessage(null)
    const incoming = Array.from(fileList)
    const imageFiles = incoming.filter((file) => file.type.startsWith('image/'))
    const errors: string[] = []

    if (imageFiles.length !== incoming.length) errors.push('Choose image files only.')

    const current = imagesRef.current
    const availableSlots = Math.max(0, safeMaxFiles - current.length)
    if (imageFiles.length > availableSlots) {
      errors.push(availableSlots > 0
        ? `Only ${availableSlots} more ${availableSlots === 1 ? 'photo can' : 'photos can'} be added.`
        : `The limit is ${safeMaxFiles} photos. Remove a photo before adding more.`)
    }

    const next: PickedImage[] = []
    imageFiles.slice(0, availableSlots).forEach((file) => {
      if (maxSizeMB > 0 && file.size > maxSizeMB * 1024 * 1024) {
        errors.push(`${file.name} exceeds the ${maxSizeMB} MB limit.`)
        return
      }

      next.push({
        id: makeId(),
        file,
        previewUrl: URL.createObjectURL(file),
        sizeBytes: file.size,
        status: uploadFn ? 'loading' : 'ready',
      })
    })

    if (errors.length > 0) setErrorMessage(errors[0])
    if (next.length === 0) return

    updateImages((currentImages) => [...currentImages, ...next])
    if (uploadFn) next.forEach((image) => void uploadImage(image))
  }

  function removeImage(image: PickedImage) {
    const removedIndex = imagesRef.current.findIndex((item) => item.id === image.id)
    URL.revokeObjectURL(image.previewUrl)
    updateImages((current) => current.filter((item) => item.id !== image.id))
    setPreviewIndex((current) => {
      if (current === null || current === removedIndex) return null
      return current > removedIndex ? current - 1 : current
    })
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (!disabled) addFiles(event.dataTransfer.files)
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    if (disabled) return
    const pastedImages = Array.from(event.clipboardData.files)
      .filter((file) => file.type.startsWith('image/'))
    if (pastedImages.length === 0) return
    event.preventDefault()
    addFiles(pastedImages)
  }

  function handlePreviewKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      setPreviewIndex((current) => current === null ? current : Math.max(0, current - 1))
    }
    if (event.key === 'ArrowRight') {
      setPreviewIndex((current) => current === null ? current : Math.min(images.length - 1, current + 1))
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.files?.length) addFiles(event.currentTarget.files)
    event.currentTarget.value = ''
  }

  return (
    <section
      className={cn('grid min-w-0 gap-3', className)}
      aria-label={label}
      onPaste={handlePaste}
      onDragEnter={(event) => {
        event.preventDefault()
        if (!disabled) setIsDragging(true)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false)
      }}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        disabled={disabled}
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div>
          <p className="text-sm font-bold text-text-primary">Photos</p>
          <p className="text-xs text-text-secondary">
            {helperText ?? 'Add image files or drop them here.'}
          </p>
        </div>
        <p className="text-xs font-medium text-text-secondary tabular">
          {images.length} of {safeMaxFiles}
          {maxSizeMB > 0 ? ` · ${maxSizeMB} MB max each` : ''}
        </p>
      </div>

      <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4', isDragging && 'rounded-md ring-2 ring-primary/25')}>
        {images.map((image, index) => (
          <article key={image.id} className="min-w-0 overflow-hidden rounded-md border border-border bg-surface">
            <div className="relative aspect-square bg-surface-soft">
              <button
                type="button"
                className="absolute inset-0 size-full cursor-zoom-in focus-visible:z-10"
                onClick={() => setPreviewIndex(index)}
                aria-label={`Preview ${image.file.name}`}
              >
                <img src={image.previewUrl} alt="" className="size-full object-cover" />
              </button>
              <div className="absolute end-1 top-1 z-10 flex gap-1">
                <Button
                  type="button"
                  variant="neutral"
                  size="icon-sm"
                  title="Preview image"
                  aria-label={`Preview ${image.file.name}`}
                  onClick={() => setPreviewIndex(index)}
                >
                  <ZoomIn aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="neutral"
                  size="icon-sm"
                  title="Remove image"
                  aria-label={`Remove ${image.file.name}`}
                  onClick={() => removeImage(image)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
              {image.status === 'loading' && (
                <div className="absolute inset-0 z-5 grid place-items-center bg-surface/90 text-primary" aria-live="polite">
                  <span className="flex items-center gap-2 rounded-sm bg-surface px-2 py-1 text-xs font-semibold shadow-card">
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    Uploading
                  </span>
                </div>
              )}
              {image.status === 'error' && (
                <div className="absolute inset-0 z-5 grid place-items-center bg-destructive-soft/90 text-destructive" role="status">
                  <span className="flex items-center gap-1 rounded-sm bg-surface px-2 py-1 text-xs font-semibold shadow-card">
                    <AlertCircle size={14} aria-hidden="true" />
                    Upload failed
                  </span>
                </div>
              )}
            </div>
            <div className="flex min-w-0 items-center gap-2 border-t border-border-soft px-2 py-1.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-text-primary" title={image.file.name}>{image.file.name}</p>
                <p className="text-2xs text-text-secondary">{formatBytes(image.sizeBytes)}</p>
              </div>
              {image.status === 'error' && uploadFn && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  title="Retry upload"
                  aria-label={`Retry upload for ${image.file.name}`}
                  onClick={() => {
                    updateImages((current) => current.map((item) => item.id === image.id
                      ? { ...item, status: 'loading', error: undefined }
                      : item))
                    void uploadImage(image)
                  }}
                >
                  <RotateCcw aria-hidden="true" />
                </Button>
              )}
            </div>
          </article>
        ))}

        {images.length < safeMaxFiles && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex min-w-0 flex-col items-center justify-center gap-2 border border-dashed border-border-strong bg-surface-soft text-text-secondary transition-colors hover:border-primary hover:bg-primary-soft-light hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50',
              images.length === 0
                ? 'col-span-2 min-h-32 rounded-md px-4 py-5 sm:col-span-3 xl:col-span-4'
                : 'aspect-square rounded-md p-2',
              isDragging && 'border-primary bg-primary-soft-light text-primary',
            )}
          >
            <ImagePlus size={20} aria-hidden="true" />
            <span className="text-sm font-semibold">{label}</span>
          </button>
        )}
      </div>

      {errorMessage && <p role="alert" className="text-xs font-medium text-destructive">{errorMessage}</p>}

      {previewImage && previewIndex !== null && (
        <Dialog open onOpenChange={(open) => { if (!open) setPreviewIndex(null) }}>
          <DialogContent
            size="xl"
            className="grid gap-3 sm:max-w-5xl"
            onKeyDown={handlePreviewKeyDown}
          >
            <DialogHeader>
              <DialogTitle className="wrap-break-word pe-8">{previewImage.file.name}</DialogTitle>
              <DialogDescription>
                {previewIndex + 1} of {images.length} photos
              </DialogDescription>
            </DialogHeader>
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
              <Button
                type="button"
                variant="neutral"
                size="icon"
                aria-label="Previous photo"
                disabled={previewIndex === 0}
                onClick={() => setPreviewIndex((current) => current === null ? current : Math.max(0, current - 1))}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <img
                src={previewImage.previewUrl}
                alt={previewImage.file.name}
                className="mx-auto max-h-[70dvh] max-w-full object-contain"
              />
              <Button
                type="button"
                variant="neutral"
                size="icon"
                aria-label="Next photo"
                disabled={previewIndex >= images.length - 1}
                onClick={() => setPreviewIndex((current) => current === null ? current : Math.min(images.length - 1, current + 1))}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  )
}