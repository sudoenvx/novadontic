export interface Setting {
  key: string;
  value: string;
  group: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingInput {
  value: string;
  group?: string | null;
}

export interface SettingListInput {
  group?: string | undefined;
}

export interface SettingsServiceContract {
  list(input: SettingListInput): Promise<Setting[]>;
  getByKey(key: string): Promise<Setting>;
  save(key: string, input: SettingInput): Promise<Setting>;
  delete(key: string): Promise<void>;
}
