export type ApplianceFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'date'
  | 'checkbox'
  | 'file'
  | 'image';

export interface ApplianceFieldOption {
  label: string;
  value: string;
}

export interface ApplianceField {
  id: string;
  groupId: string | null;
  key: string;
  label: string;
  type: ApplianceFieldType;
  options: ApplianceFieldOption[];
  defaultValue: string | null;
  dependsOn: string | null;
  dependsOnValue: string | null;
  required: boolean;
  sortOrder: number;
  helpText: string | null;
}

export interface ApplianceFieldGroup {
  id: string;
  name: string;
  sortOrder: number;
  fields: ApplianceField[];
}

export interface ApplianceType {
  id: string;
  code: string;
  name: string;
  source: 'Platform default' | 'Custom type';
  color: string | null;
  isActive: boolean;
  sortOrder: number;
  fieldGroups: ApplianceFieldGroup[];
}

export interface ApplianceTypeInput {
  name: string;
  color?: string | null;
  sortOrder?: number;
}

export interface ApplianceTypeUpdateInput {
  name?: string;
  color?: string | null;
  sortOrder?: number;
}

export interface ApplianceTypeListInput {
  search?: string | undefined;
  isActive?: boolean | undefined;
  limit: number;
  cursor?: string | undefined;
}

export interface ApplianceTypeListResult {
  data: ApplianceType[];
  nextCursor: string | null;
  total: number;
}

export interface ApplianceFieldGroupInput {
  name: string;
  sortOrder?: number;
}

export interface ApplianceFieldGroupUpdateInput {
  name?: string;
  sortOrder?: number;
}

export interface ApplianceFieldInput {
  key: string;
  label: string;
  type: ApplianceFieldType;
  options: ApplianceFieldOption[];
  defaultValue?: string | null;
  dependsOn?: string | null;
  dependsOnValue?: string | null;
  required?: boolean;
  sortOrder?: number;
  helpText?: string | null;
}

export type ApplianceFieldUpdateInput = Partial<ApplianceFieldInput>;

export interface AppliancesServiceContract {
  listTypes(input: ApplianceTypeListInput): Promise<ApplianceTypeListResult>;
  getTypeById(id: string): Promise<ApplianceType>;
  getGroups(typeId: string): Promise<ApplianceFieldGroup[]>;
  createType(input: ApplianceTypeInput): Promise<ApplianceType>;
  updateType(id: string, input: ApplianceTypeUpdateInput): Promise<ApplianceType>;
  setTypeActive(id: string, isActive: boolean): Promise<ApplianceType>;
  deleteType(id: string): Promise<void>;
  createGroup(typeId: string, input: ApplianceFieldGroupInput): Promise<ApplianceFieldGroup>;
  updateGroup(
    typeId: string,
    groupId: string,
    input: ApplianceFieldGroupUpdateInput,
  ): Promise<ApplianceFieldGroup>;
  deleteGroup(typeId: string, groupId: string): Promise<void>;
  createField(
    typeId: string,
    groupId: string,
    input: ApplianceFieldInput,
  ): Promise<ApplianceField>;
  updateField(
    typeId: string,
    groupId: string,
    fieldId: string,
    input: ApplianceFieldUpdateInput,
  ): Promise<ApplianceField>;
  deleteField(typeId: string, groupId: string, fieldId: string): Promise<void>;
}
