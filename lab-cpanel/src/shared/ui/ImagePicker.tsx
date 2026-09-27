import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, X, Loader2, AlertCircle, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { formatBytes, makeId } from '../lib/file/fileHelpers';

export type ImageStatus = 'loading' | 'ready' | 'error';

export interface PickedImage {
  id: string;
  file: File;
  /** Local object URL — always available immediately for a preview. */
  previewUrl: string;
  sizeBytes: number;
  status: ImageStatus;
  error?: string;
  /** Set once uploadFn resolves, if you provide one. */
  remoteUrl?: string;
}

export interface ImagePickerProps {
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  /** Label on the "add" tile and the hidden input's accessible name. */
  label?: string;
  helperText?: string;
  /** Provide to actually upload (e.g. to storage). Omit to keep local previews only. */
  uploadFn?: (file: File) => Promise<{ url: string }>;
  onChange?: (images: PickedImage[]) => void;
  className?: string;
}

/**
 * Multi-image picker: grid of thumbnails with a per-image loading/error
 * overlay, click-to-zoom lightbox (keyboard arrows + escape), drag & drop,
 * paste-from-clipboard, and object-URL cleanup so previews don't leak memory.
 */
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
  const [images, setImages] = useState<PickedImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // Revoke every object URL on unmount so previews don't leak memory.
  useEffect(() => {
    return () => { images.forEach(img => URL.revokeObjectURL(img.previewUrl)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = (next: PickedImage[]) => { setImages(next); onChange?.(next); };

  const addFiles = useCallback((fileList: FileList | File[]) => {
    setGlobalError(null);
    const incoming = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    const room = Math.max(0, maxFiles - images.length);
    if (incoming.length > room) {
      setGlobalError(`You can add up to ${maxFiles} photos. ${room > 0 ? `Only the first ${room} were added.` : 'Remove one to add another.'}`);
    }
    const next: PickedImage[] = [];
    incoming.slice(0, room).forEach(file => {
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        setGlobalError(`"${file.name}" is larger than ${maxSizeMB}MB and was skipped.`);
        return;
      }
      next.push({
        id: makeId(),
        file,
        previewUrl: URL.createObjectURL(file),
        sizeBytes: file.size,
        status: uploadFn ? 'loading' : 'ready',
      });
    });
    if (!next.length) return;
    const merged = [...images, ...next];
    emit(merged);
    if (uploadFn) {
      next.forEach(img => {
        uploadFn(img.file)
          .then(res => setImages(curr => { const m = curr.map(i => (i.id === img.id ? { ...i, status: 'ready' as const, remoteUrl: res.url } : i)); onChange?.(m); return m; }))
          .catch(err => setImages(curr => { const m = curr.map(i => (i.id === img.id ? { ...i, status: 'error' as const, error: err?.message || 'Upload failed' } : i)); onChange?.(m); return m; }));
      });
    }
  }, [images, maxFiles, maxSizeMB, uploadFn]);

  const removeImage = (id: string) => {
    const img = images.find(i => i.id === id);
    if (img) URL.revokeObjectURL(img.previewUrl);
    emit(images.filter(i => i.id !== id));
    setLightboxIndex(null);
  };

  // Paste a screenshot / copied image straight in.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const files = Array.from(e.clipboardData?.files ?? []).filter(f => f.type.startsWith('image/'));
      if (files.length) addFiles(files);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addFiles, disabled]);

  // Lightbox keyboard controls.
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i !== null && i > 0 ? i - 1 : i));
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i !== null && i < images.length - 1 ? i + 1 : i));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, images.length]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div className={className} onDragOver={e => e.preventDefault()} onDrop={onDrop}>
      <label htmlFor={inputId} className="sr-only">{label}</label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={e => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; }}
      />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((img, idx) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-md bg-surface-soft">
            <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />

            {img.status === 'loading' && (
              <div className="absolute inset-0 grid place-items-center bg-ink/40">
                <Loader2 className="h-5 w-5 animate-spin text-white" aria-label="Uploading" />
              </div>
            )}
            {img.status === 'error' && (
              <div className="absolute inset-0 grid place-items-center bg-red-600/70" title={img.error}>
                <AlertCircle className="h-5 w-5 text-white" aria-label={img.error || 'Upload failed'} />
              </div>
            )}

            <div className="absolute inset-0 hidden items-center justify-center gap-1.5 bg-ink/40 group-hover:flex group-focus-within:flex">
              <button type="button" onClick={() => setLightboxIndex(idx)} className="grid h-7 w-7 place-items-center rounded-md bg-white/90 text-ink" aria-label="View full size">
                <ZoomIn className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => removeImage(img.id)} className="grid h-7 w-7 place-items-center rounded-md bg-white/90 text-red-600" aria-label="Remove photo">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {images.length < maxFiles && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-muted-2 text-muted hover:bg-surface-soft disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" aria-hidden />
            <span className="text-[11px] font-semibold">{label}</span>
          </button>
        )}
      </div>

      <p className="mt-1.5 text-xs text-muted">
        {images.length}/{maxFiles} photos
        {maxSizeMB ? ` · up to ${maxSizeMB}MB each` : ''}
        {helperText ? ` · ${helperText}` : ''}
      </p>
      {globalError && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{globalError}</p>}
      {images.some(i => i.status === 'error') && (
        <p className="mt-0.5 text-[11px] text-muted">{formatBytes(images.reduce((n, i) => n + i.sizeBytes, 0))} total</p>
      )}

      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6"
          onClick={() => setLightboxIndex(null)}
        >
          <button type="button" onClick={() => setLightboxIndex(null)} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-md bg-white/10 text-white hover:bg-white/20" aria-label="Close preview">
            <X className="h-5 w-5" />
          </button>
          {lightboxIndex > 0 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i ?? 1) - 1); }}
              className="absolute left-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <img
            src={images[lightboxIndex].previewUrl}
            alt=""
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={e => e.stopPropagation()}
          />
          {lightboxIndex < images.length - 1 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i ?? 0) + 1); }}
              className="absolute right-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}