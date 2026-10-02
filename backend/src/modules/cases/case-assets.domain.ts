export type CaseFileKind = 'model' | 'image' | 'document';

export interface CaseFile {
  id: string;
  caseNumber: string;
  stageId: string | null;
  stageName: string | null;
  name: string;
  mimeType: string;
  kind: CaseFileKind;
  sizeBytes: number;
  uploadedBy: string;
  createdAt: Date;
}

export interface CaseTimelineEntry {
  id: string;
  kind: 'event' | 'comment';
  eventType: string | null;
  message: string;
  author: string;
  createdAt: Date;
}

export interface CaseActivityActor {
  id: string;
  fullName: string;
}

export interface CaseFileUpload {
  storageKey: string;
  originalName: string;
  mimeType: string;
  kind: CaseFileKind;
  sizeBytes: number;
}

export interface StoredCaseFile extends CaseFile {
  storagePath: string;
}

export interface CaseAssetsServiceContract {
  listFiles(caseNumber: string, kind?: CaseFileKind): Promise<CaseFile[]>;
  uploadFile(
    caseNumber: string,
    stageId: string | null,
    upload: CaseFileUpload,
    actor: CaseActivityActor,
  ): Promise<CaseFile>;
  getFile(caseNumber: string, fileId: string): Promise<StoredCaseFile>;
  renameFile(
    caseNumber: string,
    fileId: string,
    name: string,
    actor: CaseActivityActor,
  ): Promise<CaseFile>;
  deleteFile(
    caseNumber: string,
    fileId: string,
    actor: CaseActivityActor,
  ): Promise<void>;
  listActivity(caseNumber: string): Promise<CaseTimelineEntry[]>;
  addComment(
    caseNumber: string,
    message: string,
    actor: CaseActivityActor,
  ): Promise<CaseTimelineEntry>;
}
