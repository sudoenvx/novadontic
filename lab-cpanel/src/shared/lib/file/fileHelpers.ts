export type FileKind = 'stl' | 'photo' | 'pdf' | 'doc' | 'other';

const KIND_EXT: Record<FileKind, string[]> = {
  stl: ['stl'],
  photo: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic'],
  pdf: ['pdf'],
  doc: ['doc', 'docx', 'txt', 'csv'],
  other: [],
};

/** Guesses a broad file "kind" from its name, used to pick an icon/color. */
export function detectFileKind(fileName: string): FileKind {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  for (const kind of Object.keys(KIND_EXT) as FileKind[]) {
    if (KIND_EXT[kind].includes(ext)) return kind;
  }
  return 'other';
}

/** Formats a byte count as "1.4 MB", "820 KB", etc. */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/** Small unique-enough id for list keys / abort-controller lookups (not a UUID). */
export function makeId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}