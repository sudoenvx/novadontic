import React, { useCallback, useId, useRef, useState } from 'react';
import { UploadCloud, X, RotateCcw, CheckCircle2, Loader2, FileText, Box, Image as ImageIcon, FileType } from 'lucide-react';
import { detectFileKind, formatBytes, makeId, type FileKind } from '../lib/file/fileHelpers';

export type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface UploadItem {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  kind: FileKind;
  status: UploadStatus;
  progress: number; // 0-100
  error?: string;
  url?: string; // set once uploadFn resolves
}

export interface FileUploaderProps {
  /** Comma-separated accept string for the native picker, e.g. ".stl,.jpg,.png,.pdf" */
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  /**
   * Provide this to actually upload files (to S3, your API, etc). It must
   * report progress via onProgress(0-100) and respect the abort signal.
   * Omit it to just collect files locally (useful while wiring up a form).
   */
  uploadFn?: (file: File, onProgress: (pct: number) => void, signal: AbortSignal) => Promise<{ url: string }>;
  onChange?: (items: UploadItem[]) => void;
  className?: string;
}

const KIND_STYLE: Record<FileKind, { icon: React.ElementType; classes: string }> = {
  stl: { icon: Box, classes: 'bg-file-stl' },
  photo: { icon: ImageIcon, classes: 'bg-file-photo' },
  pdf: { icon: FileText, classes: 'bg-file-pdf' },
  doc: { icon: FileType, classes: 'bg-file-doc' },
  other: { icon: FileType, classes: 'bg-muted-2' },
};

/**
 * Multi-file dropzone: drag & drop or click to browse, per-file progress and
 * retry, size/count/type validation, and an aria-live file list for screen
 * readers. Works standalone (no uploadFn) or wired to a real upload backend.
 */
export default function FileUploader({
  accept,
  multiple = true,
  maxFiles,
  maxSizeMB,
  disabled = false,
  label = 'Upload files',
  helperText,
  uploadFn,
  onChange,
  className = '',
}: FileUploaderProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const controllers = useRef<Map<string, AbortController>>(new Map());
  const inputId = useId();

  const emit = (next: UploadItem[]) => { setItems(next); onChange?.(next); };

  const startUpload = useCallback((item: UploadItem, list: UploadItem[]) => {
    if (!uploadFn) {
      emit(list.map(i => (i.id === item.id ? { ...i, status: 'done', progress: 100 } : i)));
      return;
    }
    const controller = new AbortController();
    controllers.current.set(item.id, controller);
    emit(list.map(i => (i.id === item.id ? { ...i, status: 'uploading', progress: 0 } : i)));

    uploadFn(
      item.file,
      pct => setItems(curr => { const next = curr.map(i => (i.id === item.id ? { ...i, progress: pct } : i)); onChange?.(next); return next; }),
      controller.signal,
    )
      .then(res => {
        setItems(curr => {
          const next = curr.map(i => (i.id === item.id ? { ...i, status: 'done' as const, progress: 100, url: res.url } : i));
          onChange?.(next);
          return next;
        });
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        setItems(curr => {
          const next = curr.map(i => (i.id === item.id ? { ...i, status: 'error' as const, error: err?.message || 'Upload failed' } : i));
          onChange?.(next);
          return next;
        });
      })
      .finally(() => controllers.current.delete(item.id));
  }, [uploadFn]);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    setGlobalError(null);
    const incoming = Array.from(fileList);
    const room = maxFiles ? Math.max(0, maxFiles - items.length) : incoming.length;
    if (maxFiles && incoming.length > room) {
      setGlobalError(
        `You can add up to ${maxFiles} file${maxFiles === 1 ? '' : 's'} total. ${
          room > 0 ? `Only the first ${room} were added.` : 'No more files can be added.'
        }`,
      );
    }
    const accepted: UploadItem[] = [];
    incoming.slice(0, room).forEach(file => {
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        setGlobalError(`"${file.name}" is larger than ${maxSizeMB}MB and was skipped.`);
        return;
      }
      accepted.push({
        id: makeId(),
        file,
        name: file.name,
        sizeBytes: file.size,
        kind: detectFileKind(file.name),
        status: 'pending',
        progress: 0,
      });
    });
    if (!accepted.length) return;
    const next = [...items, ...accepted];
    emit(next);
    accepted.forEach(item => startUpload(item, next));
  }, [items, maxFiles, maxSizeMB, startUpload]);

  const removeItem = (id: string) => {
    controllers.current.get(id)?.abort();
    emit(items.filter(i => i.id !== id));
  };

  const retryItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) startUpload({ ...item, status: 'pending', progress: 0, error: undefined }, items);
  };

  const clearAll = () => {
    items.forEach(i => controllers.current.get(i.id)?.abort());
    emit([]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled && e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const totalSize = items.reduce((n, i) => n + i.sizeBytes, 0);

  return (
    <div className={className}>
      <label htmlFor={inputId} className="sr-only">{label}</label>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={e => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border px-4 py-7 text-center transition-colors',
          disabled
            ? 'cursor-not-allowed border-dashed border-muted-2 bg-surface-soft opacity-50'
            : dragOver
            ? 'border-solid border-brand-blue bg-surface-soft ring-2 ring-brand-blue/20'
            : 'border-dashed border-muted-2 bg-surface-soft hover:bg-surface-sunk',
        ].join(' ')}
      >
        <UploadCloud className="h-6 w-6 text-muted" aria-hidden />
        <p className="text-sm font-semibold text-brand-navy">{label}</p>
        <p className="text-xs text-muted">
          Drag & drop, or click to browse
          {accept ? ` · ${accept.split(',').join(', ')}` : ''}
          {maxSizeMB ? ` · up to ${maxSizeMB}MB each` : ''}
        </p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={e => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {helperText && <p className="mt-1.5 text-xs text-muted">{helperText}</p>}
      {globalError && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{globalError}</p>}

      {items.length > 0 && (
        <ul className="mt-2 grid gap-1.5" aria-live="polite">
          {items.map(item => {
            const kindInfo = KIND_STYLE[item.kind];
            const Icon = kindInfo.icon;
            return (
              <li key={item.id} className="flex items-center gap-2.5 rounded-md bg-surface-soft px-2.5 py-2">
                <span className={`grid h-7 w-7 flex-none place-items-center rounded-md text-white ${kindInfo.classes}`}>
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">{item.name}</p>
                  {item.status === 'uploading' ? (
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-gradient-brand transition-all" style={{ width: `${item.progress}%` }} />
                    </div>
                  ) : item.status === 'error' ? (
                    <p className="text-[11px] text-red-600">{item.error}</p>
                  ) : (
                    <p className="text-[11px] text-muted">{formatBytes(item.sizeBytes)}</p>
                  )}
                </div>
                {item.status === 'uploading' && <Loader2 className="h-4 w-4 flex-none animate-spin text-brand-blue" aria-label="Uploading" />}
                {item.status === 'done' && <CheckCircle2 className="h-4 w-4 flex-none text-emerald-600" aria-label="Uploaded" />}
                {item.status === 'error' && (
                  <button type="button" onClick={() => retryItem(item.id)} className="flex-none rounded-md p-1 text-muted hover:bg-white" aria-label={`Retry ${item.name}`}>
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                <button type="button" onClick={() => removeItem(item.id)} className="flex-none rounded-md p-1 text-muted hover:bg-white" aria-label={`Remove ${item.name}`}>
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {items.length > 0 && (
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
          <span>{items.length} file{items.length === 1 ? '' : 's'} · {formatBytes(totalSize)}</span>
          <button type="button" onClick={clearAll} className="font-semibold text-red-600 hover:underline">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}