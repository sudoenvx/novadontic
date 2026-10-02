import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { once } from 'node:events';
import { after, before, describe, it } from 'node:test';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type {
  AuthenticatedStaffUser,
  AuthServiceContract,
  AuthSessionResponse,
  LoginInput,
} from '../modules/auth/auth.domain.ts';
import type { RequestMetadata } from '../modules/auth/auth.domain.ts';
import type {
  CreateStaffInput,
  StaffListInput,
  StaffListResult,
  StaffMember,
  StaffServiceContract,
  UpdateStaffInput,
} from '../modules/staff/staff.domain.ts';
import type {
  ApplianceField,
  ApplianceFieldGroup,
  ApplianceFieldGroupInput,
  ApplianceFieldGroupUpdateInput,
  ApplianceFieldInput,
  ApplianceFieldUpdateInput,
  ApplianceType,
  ApplianceTypeInput,
  ApplianceTypeListInput,
  ApplianceTypeListResult,
  ApplianceTypeUpdateInput,
  AppliancesServiceContract,
} from '../modules/appliances/appliances.domain.ts';
import type {
  Clinic,
  ClinicInput,
  ClinicListInput,
  ClinicListResult,
  ClinicsServiceContract,
} from '../modules/clinics/clinics.domain.ts';
import { AppError } from '../shared/errors/app-error.ts';
import type {
  Setting,
  SettingInput,
  SettingListInput,
  SettingsServiceContract,
} from '../modules/settings/settings.domain.ts';
import type {
  Doctor,
  DoctorInput,
  DoctorListInput,
  DoctorListResult,
  DoctorUpdateInput,
  DoctorsServiceContract,
} from '../modules/doctors/doctors.domain.ts';
import type {
  Permission,
  Role,
  RoleInput,
  RoleListInput,
  RoleUpdateInput,
  RolesServiceContract,
} from '../modules/roles/roles.domain.ts';
import type {
  WorkflowListInput,
  WorkflowStage,
  WorkflowStageInput,
  WorkflowStageUpdateInput,
  WorkflowTemplate,
  WorkflowTemplateInput,
  WorkflowTemplateUpdateInput,
  WorkflowsServiceContract,
} from '../modules/workflows/workflows.domain.ts';
import type {
  CaseListInput,
  CaseListResult,
  CaseRecord,
  CaseStage,
  CasesServiceContract,
  CreateCaseInput,
  UpdateCaseInput,
} from '../modules/cases/cases.domain.ts';
import type {
  CaseActivityActor,
  CaseAssetsServiceContract,
  CaseFile,
  CaseFileKind,
  CaseFileUpload,
  CaseTimelineEntry,
  StoredCaseFile,
} from '../modules/cases/case-assets.domain.ts';
import { CaseFileStorage } from '../modules/cases/case-file-storage.ts';

process.env['AUTH_JWT_SECRET'] = 'http-test-secret-that-is-at-least-32-characters';
process.env['DATABASE_URL'] ??= 'mysql://127.0.0.1:3306/test';

const { createApp } = await import('./app.ts');
const { createApiRoutes } = await import('./routes.ts');

const user = {
  id: '12',
  email: 'admin@example.test',
  fullName: 'Lab Admin',
  roles: ['admin'],
  permissions: [
    'settings.manage',
    'roles:view',
    'roles:create',
    'roles:update',
    'roles:delete',
    'roles:manage_permissions',
    'doctors:view',
    'doctors:create',
    'doctors:update',
    'doctors:delete',
    'appliances:view',
    'appliances:create',
    'appliances:update',
    'appliances:delete',
    'appliances:activate',
    'appliance_fields:view',
    'appliance_fields:create',
    'appliance_fields:update',
    'appliance_fields:delete',
    'workflows:view',
    'workflows:create',
    'workflows:update',
    'workflows:delete',
    'workflow_steps:create',
    'workflow_steps:update',
    'workflow_steps:delete',
    'workflow_steps:reorder',
    'cases:view',
    'cases:create',
    'cases:update',
    'cases:move',
    'case_files:view',
    'case_files:upload',
    'case_files:update',
    'case_files:download',
    'case_files:delete',
    'case_activity:view',
    'case_activity:add_note',
    'clinics:view',
    'clinics:create',
    'clinics:update',
    'clinics:delete',
    'lab_settings:view',
    'lab_settings:update',
    'staff:view',
    'staff:create',
    'staff:update',
    'staff:delete',
    'staff:suspend',
  ],
};

class InMemoryAuthService implements AuthServiceContract {
  readonly activeTokens = new Set<string>();
  permissionOverride: string[] | undefined;
  loginInput: LoginInput | undefined;
  private sequence = 0;

  async login(input: LoginInput, _metadata: RequestMetadata): Promise<AuthSessionResponse> {
    this.loginInput = input;
    const token = `access-${++this.sequence}`;
    this.activeTokens.add(token);
    return {
      accessToken: token,
      refreshToken: 'a'.repeat(64),
      expiresIn: 900,
      user,
    };
  }

  async refresh(): Promise<AuthSessionResponse> {
    return {
      accessToken: 'refreshed-access',
      refreshToken: 'b'.repeat(64),
      expiresIn: 900,
      user,
    };
  }

  async authenticateAccess(token: string): Promise<AuthenticatedStaffUser | null> {
    if (!this.activeTokens.has(token)) return null;
    return {
      ...user,
      ...(this.permissionOverride ? { permissions: this.permissionOverride } : {}),
      sessionId: 'session-1',
    };
  }

  async logout(): Promise<void> {
    this.activeTokens.clear();
  }
}

class InMemoryClinicsService implements ClinicsServiceContract {
  readonly clinics = new Map<string, Clinic>();
  private sequence = 0;

  async list(input: ClinicListInput): Promise<ClinicListResult> {
    const clinics = [...this.clinics.values()]
      .filter((clinic) => input.isActive === undefined || clinic.isActive === input.isActive)
      .filter((clinic) => !input.search || clinic.name.toLowerCase().includes(input.search.toLowerCase()))
      .filter((clinic) => !input.cursor || BigInt(clinic.id) > BigInt(input.cursor))
      .slice(0, input.limit);
    return { data: clinics, nextCursor: null, total: clinics.length };
  }

  async getById(id: string): Promise<Clinic> {
    const clinic = this.clinics.get(id);
    if (!clinic) throw new Error('Clinic not found');
    return clinic;
  }

  async create(input: ClinicInput): Promise<Clinic> {
    const now = new Date();
    const clinic: Clinic = {
      id: String(++this.sequence),
      name: input.name,
      legalName: input.legalName ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      website: input.website ?? null,
      address: input.address ?? null,
      city: input.city ?? null,
      notes: input.notes ?? null,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
      doctors: [],
    };
    this.clinics.set(clinic.id, clinic);
    return clinic;
  }

  async update(id: string, input: Partial<ClinicInput>): Promise<Clinic> {
    const clinic = await this.getById(id);
    const updated = { ...clinic, ...input, updatedAt: new Date() };
    this.clinics.set(id, updated);
    return updated;
  }

  async deactivate(id: string): Promise<void> {
    await this.update(id, { isActive: false });
  }
}

class InMemorySettingsService implements SettingsServiceContract {
  readonly settings = new Map<string, Setting>();

  async list(input: SettingListInput): Promise<Setting[]> {
    return [...this.settings.values()]
      .filter((setting) => input.group === undefined || setting.group === input.group)
      .sort((left, right) => left.key.localeCompare(right.key));
  }

  async getByKey(key: string): Promise<Setting> {
    const setting = this.settings.get(key);
    if (!setting) throw new AppError(`Setting "${key}" was not found`, 404, 'SETTING_NOT_FOUND');
    return setting;
  }

  async save(key: string, input: SettingInput): Promise<Setting> {
    const existing = this.settings.get(key);
    const now = new Date();
    const setting: Setting = {
      key,
      value: input.value,
      group: input.group === undefined ? existing?.group ?? null : input.group,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.settings.set(key, setting);
    return setting;
  }

  async delete(key: string): Promise<void> {
    if (!this.settings.delete(key)) {
      throw new AppError(`Setting "${key}" was not found`, 404, 'SETTING_NOT_FOUND');
    }
  }
}

class InMemoryRolesService implements RolesServiceContract {
  readonly permissions: Permission[] = [
    { code: 'doctors:view', module: 'doctors', description: 'View doctors' },
    { code: 'roles:view', module: 'roles', description: 'View roles' },
    { code: 'roles:create', module: 'roles', description: 'Create roles' },
    { code: 'roles:update', module: 'roles', description: 'Update roles' },
    { code: 'roles:delete', module: 'roles', description: 'Delete roles' },
    { code: 'roles:manage_permissions', module: 'roles', description: 'Manage role permissions' },
  ];
  readonly roles = new Map<string, Role>([
    ['1', {
      id: '1',
      code: 'owner',
      name: 'Owner',
      description: 'Unrestricted access',
      type: 'owner',
      isSystem: true,
      staffCount: 1,
      permissions: this.permissions.map(({ code }) => code),
    }],
    ['2', {
      id: '2',
      code: 'administrator',
      name: 'Administrator',
      description: 'Manage the lab',
      type: 'system',
      isSystem: true,
      staffCount: 1,
      permissions: this.permissions.map(({ code }) => code),
    }],
  ]);
  private sequence = 2;

  async listPermissions(module?: string): Promise<Permission[]> {
    return this.permissions.filter((permission) => !module || permission.module === module);
  }

  async list(input: RoleListInput): Promise<Role[]> {
    return [...this.roles.values()].filter((role) =>
      !input.search || role.name.toLowerCase().includes(input.search.toLowerCase()));
  }

  async getById(id: string): Promise<Role> {
    const role = this.roles.get(id);
    if (!role) throw new AppError('Role was not found', 404, 'ROLE_NOT_FOUND');
    return role;
  }

  async create(input: RoleInput): Promise<Role> {
    const code = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    if ([...this.roles.values()].some((role) => role.code === code)) {
      throw new AppError('A role with this name already exists', 409, 'ROLE_ALREADY_EXISTS');
    }
    const role: Role = {
      id: String(++this.sequence),
      code,
      name: input.name,
      description: input.description,
      type: 'custom',
      isSystem: false,
      staffCount: 0,
      permissions: [],
    };
    this.roles.set(role.id, role);
    return role;
  }

  async update(id: string, input: RoleUpdateInput): Promise<Role> {
    const current = await this.getById(id);
    const updated = { ...current, ...input };
    this.roles.set(id, updated);
    return updated;
  }

  async setPermissions(id: string, permissionCodes: string[]): Promise<Role> {
    const current = await this.getById(id);
    if (current.type === 'owner') {
      throw new AppError('The owner role always has all permissions', 409, 'OWNER_PERMISSIONS_IMMUTABLE');
    }
    const validCodes = new Set(this.permissions.map(({ code }) => code));
    if (permissionCodes.some((code) => !validCodes.has(code))) {
      throw new AppError('One or more permission codes are invalid', 422, 'INVALID_PERMISSION_CODES');
    }
    const updated = { ...current, permissions: permissionCodes };
    this.roles.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const role = await this.getById(id);
    if (role.isSystem) throw new AppError('System roles cannot be deleted', 409, 'SYSTEM_ROLE_IMMUTABLE');
    if (role.staffCount > 0) throw new AppError('Roles assigned to staff cannot be deleted', 409, 'ROLE_IN_USE');
    this.roles.delete(id);
  }
}

class InMemoryDoctorsService implements DoctorsServiceContract {
  readonly doctors = new Map<string, Doctor>();
  private sequence = 0;

  constructor(private readonly clinics: InMemoryClinicsService) {}

  async list(input: DoctorListInput): Promise<DoctorListResult> {
    const doctors = [...this.doctors.values()]
      .filter((doctor) => input.isActive === undefined || doctor.isActive === input.isActive)
      .filter((doctor) => !input.clinicId || doctor.clinics.some(({ id }) => id === input.clinicId))
      .filter((doctor) => !input.search || doctor.fullName.toLowerCase().includes(input.search.toLowerCase()))
      .filter((doctor) => !input.cursor || BigInt(doctor.id) > BigInt(input.cursor));
    const data = doctors.slice(0, input.limit);
    return {
      data,
      nextCursor: doctors.length > input.limit ? data[data.length - 1]?.id ?? null : null,
      total: doctors.length,
    };
  }

  async getById(id: string): Promise<Doctor> {
    const doctor = this.doctors.get(id);
    if (!doctor) throw new AppError('Doctor was not found', 404, 'DOCTOR_NOT_FOUND');
    return doctor;
  }

  async create(input: DoctorInput): Promise<Doctor> {
    if (input.source === 'portal' && input.clinicIds?.length) {
      throw new AppError('Portal doctors cannot be linked to clinics', 422, 'PORTAL_DOCTOR_HAS_CLINIC');
    }
    const doctor = this.makeDoctor(String(++this.sequence), input);
    this.doctors.set(doctor.id, doctor);
    return doctor;
  }

  async update(id: string, input: DoctorUpdateInput): Promise<Doctor> {
    const current = await this.getById(id);
    const clinicIds = input.clinicIds ?? (input.source === 'portal' ? [] : undefined);
    if ((input.source ?? current.source) === 'portal' && clinicIds?.length) {
      throw new AppError('Portal doctors cannot be linked to clinics', 422, 'PORTAL_DOCTOR_HAS_CLINIC');
    }
    const doctor = this.makeDoctor(id, { ...current, ...input }, clinicIds ?? current.clinics.map(({ id: clinicId }) => clinicId), current);
    this.doctors.set(id, doctor);
    return doctor;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    this.doctors.delete(id);
  }

  private makeDoctor(
    id: string,
    input: DoctorInput,
    clinicIds = input.clinicIds ?? [],
    existing?: Doctor,
  ): Doctor {
    const now = new Date();
    return {
      id,
      fullName: input.fullName,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      country: input.country ?? null,
      specialty: input.specialty ?? null,
      notes: input.notes ?? null,
      source: input.source ?? 'clinic',
      isActive: input.isActive ?? true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      clinics: clinicIds.map((clinicId) => {
        const clinic = this.clinics.clinics.get(clinicId);
        if (!clinic) throw new AppError('One or more clinics were not found', 422, 'CLINIC_NOT_FOUND');
        return { id: clinic.id, name: clinic.name };
      }),
    };
  }
}

class InMemoryAppliancesService implements AppliancesServiceContract {
  readonly types = new Map<string, ApplianceType>();
  private sequence = 0;

  async listTypes(input: ApplianceTypeListInput): Promise<ApplianceTypeListResult> {
    const filtered = [...this.types.values()]
      .filter((type) => input.isActive === undefined || type.isActive === input.isActive)
      .filter((type) => !input.search || type.name.toLowerCase().includes(input.search.toLowerCase()))
      .filter((type) => !input.cursor || BigInt(type.id) > BigInt(input.cursor))
      .sort((left, right) => BigInt(left.id) < BigInt(right.id) ? -1 : 1);
    const data = filtered.slice(0, input.limit);
    return {
      data,
      nextCursor: filtered.length > input.limit ? data[data.length - 1]?.id ?? null : null,
      total: filtered.length,
    };
  }

  async getTypeById(id: string): Promise<ApplianceType> {
    const type = this.types.get(id);
    if (!type) throw new AppError('Appliance type was not found', 404, 'APPLIANCE_TYPE_NOT_FOUND');
    return type;
  }

  async getGroups(typeId: string): Promise<ApplianceFieldGroup[]> {
    return (await this.getTypeById(typeId)).fieldGroups;
  }

  async createType(input: ApplianceTypeInput): Promise<ApplianceType> {
    if ([...this.types.values()].some((type) => type.name.toLowerCase() === input.name.toLowerCase())) {
      throw new AppError('An appliance type with this name already exists', 409, 'APPLIANCE_TYPE_EXISTS');
    }
    const type: ApplianceType = {
      id: String(++this.sequence),
      code: input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      name: input.name,
      source: 'Custom type',
      color: input.color ?? '#1e88f5',
      isActive: true,
      fieldGroups: [],
    };
    this.types.set(type.id, type);
    return type;
  }

  async updateType(id: string, input: ApplianceTypeUpdateInput): Promise<ApplianceType> {
    const type = await this.getTypeById(id);
    const updated = { ...type, ...input };
    this.types.set(id, updated);
    return updated;
  }

  async setTypeActive(id: string, isActive: boolean): Promise<ApplianceType> {
    const type = await this.getTypeById(id);
    const updated = { ...type, isActive };
    this.types.set(id, updated);
    return updated;
  }

  async deleteType(id: string): Promise<void> {
    await this.getTypeById(id);
    this.types.delete(id);
  }

  async createGroup(typeId: string, input: ApplianceFieldGroupInput): Promise<ApplianceFieldGroup> {
    const type = await this.getTypeById(typeId);
    if (type.fieldGroups.some((group) => group.name.toLowerCase() === input.name.toLowerCase())) {
      throw new AppError('A field group with this name already exists', 409, 'APPLIANCE_FIELD_GROUP_EXISTS');
    }
    const group = {
      id: String(++this.sequence),
      name: input.name,
      sortOrder: input.sortOrder ?? type.fieldGroups.length,
      fields: [],
    };
    this.types.set(typeId, { ...type, fieldGroups: [...type.fieldGroups, group] });
    return group;
  }

  async updateGroup(
    typeId: string,
    groupId: string,
    input: ApplianceFieldGroupUpdateInput,
  ): Promise<ApplianceFieldGroup> {
    const type = await this.getTypeById(typeId);
    const group = type.fieldGroups.find((item) => item.id === groupId);
    if (!group) throw new AppError('Appliance field group was not found', 404, 'APPLIANCE_FIELD_GROUP_NOT_FOUND');
    const updated = { ...group, ...input };
    this.types.set(typeId, {
      ...type,
      fieldGroups: type.fieldGroups.map((item) => item.id === groupId ? updated : item),
    });
    return updated;
  }

  async deleteGroup(typeId: string, groupId: string): Promise<void> {
    const type = await this.getTypeById(typeId);
    if (!type.fieldGroups.some((group) => group.id === groupId)) {
      throw new AppError('Appliance field group was not found', 404, 'APPLIANCE_FIELD_GROUP_NOT_FOUND');
    }
    this.types.set(typeId, {
      ...type,
      fieldGroups: type.fieldGroups.filter((group) => group.id !== groupId),
    });
  }

  async createField(
    typeId: string,
    groupId: string,
    input: ApplianceFieldInput,
  ): Promise<ApplianceField> {
    const type = await this.getTypeById(typeId);
    const group = type.fieldGroups.find((item) => item.id === groupId);
    if (!group) throw new AppError('Appliance field group was not found', 404, 'APPLIANCE_FIELD_GROUP_NOT_FOUND');
    if (type.fieldGroups.some((item) => item.fields.some((field) => field.key === input.key))) {
      throw new AppError('A field with this key already exists for the appliance type', 409, 'APPLIANCE_FIELD_KEY_EXISTS');
    }
    const field: ApplianceField = {
      id: String(++this.sequence),
      groupId,
      key: input.key,
      label: input.label,
      type: input.type,
      options: input.options,
      defaultValue: input.defaultValue ?? null,
      dependsOn: input.dependsOn ?? null,
      dependsOnValue: input.dependsOnValue ?? null,
      required: input.required ?? false,
      sortOrder: input.sortOrder ?? group.fields.length,
      helpText: input.helpText ?? null,
    };
    this.replaceGroup(type, groupId, { ...group, fields: [...group.fields, field] });
    return field;
  }

  async updateField(
    typeId: string,
    groupId: string,
    fieldId: string,
    input: ApplianceFieldUpdateInput,
  ): Promise<ApplianceField> {
    const type = await this.getTypeById(typeId);
    const group = type.fieldGroups.find((item) => item.id === groupId);
    const field = group?.fields.find((item) => item.id === fieldId);
    if (!group || !field) throw new AppError('Appliance field was not found', 404, 'APPLIANCE_FIELD_NOT_FOUND');
    if (input.key && type.fieldGroups.some((item) =>
      item.fields.some((candidate) => candidate.id !== fieldId && candidate.key === input.key))) {
      throw new AppError('A field with this key already exists for the appliance type', 409, 'APPLIANCE_FIELD_KEY_EXISTS');
    }
    const updated = { ...field, ...input };
    this.replaceGroup(type, groupId, {
      ...group,
      fields: group.fields.map((item) => item.id === fieldId ? updated : item),
    });
    return updated;
  }

  async deleteField(typeId: string, groupId: string, fieldId: string): Promise<void> {
    const type = await this.getTypeById(typeId);
    const group = type.fieldGroups.find((item) => item.id === groupId);
    if (!group || !group.fields.some((field) => field.id === fieldId)) {
      throw new AppError('Appliance field was not found', 404, 'APPLIANCE_FIELD_NOT_FOUND');
    }
    this.replaceGroup(type, groupId, {
      ...group,
      fields: group.fields.filter((field) => field.id !== fieldId),
    });
  }

  private replaceGroup(
    type: ApplianceType,
    groupId: string,
    updated: ApplianceFieldGroup,
  ): void {
    this.types.set(type.id, {
      ...type,
      fieldGroups: type.fieldGroups.map((group) => group.id === groupId ? updated : group),
    });
  }
}

class InMemoryWorkflowsService implements WorkflowsServiceContract {
  readonly templates = new Map<string, WorkflowTemplate>();
  private templateSequence = 0;
  private stageSequence = 0;

  async list(input: WorkflowListInput): Promise<WorkflowTemplate[]> {
    return [...this.templates.values()]
      .filter((template) =>
        input.applianceTypeId === undefined ||
        template.applianceTypeId === input.applianceTypeId)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  async getById(id: string): Promise<WorkflowTemplate> {
    const template = this.templates.get(id);
    if (!template) throw new AppError('Workflow template was not found', 404, 'WORKFLOW_NOT_FOUND');
    return template;
  }

  async create(input: WorkflowTemplateInput): Promise<WorkflowTemplate> {
    if ([...this.templates.values()].some(({ name }) => name === input.name)) {
      throw new AppError('A workflow template with this name already exists', 409, 'WORKFLOW_NAME_EXISTS');
    }
    if (input.isDefault) this.clearDefault(input.applianceTypeId);
    const template: WorkflowTemplate = {
      id: String(++this.templateSequence),
      applianceTypeId: input.applianceTypeId,
      name: input.name,
      isDefault: input.isDefault,
      stages: [],
    };
    this.templates.set(template.id, template);
    return template;
  }

  async update(id: string, input: WorkflowTemplateUpdateInput): Promise<WorkflowTemplate> {
    const current = await this.getById(id);
    const updated = { ...current, ...input };
    if (updated.isDefault) this.clearDefault(updated.applianceTypeId, id);
    this.templates.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    this.templates.delete(id);
  }

  async createStage(templateId: string, input: WorkflowStageInput): Promise<WorkflowStage> {
    const template = await this.getById(templateId);
    const stage: WorkflowStage = {
      id: String(++this.stageSequence),
      sortOrder: template.stages.length,
      ...input,
    };
    this.templates.set(templateId, { ...template, stages: [...template.stages, stage] });
    return stage;
  }

  async updateStage(
    templateId: string,
    stageId: string,
    input: WorkflowStageUpdateInput,
  ): Promise<WorkflowStage> {
    const template = await this.getById(templateId);
    const stage = template.stages.find(({ id }) => id === stageId);
    if (!stage) throw new AppError('Workflow stage was not found', 404, 'WORKFLOW_STAGE_NOT_FOUND');
    const updated = { ...stage, ...input };
    this.templates.set(templateId, {
      ...template,
      stages: template.stages.map((item) => item.id === stageId ? updated : item),
    });
    return updated;
  }

  async deleteStage(templateId: string, stageId: string): Promise<void> {
    const template = await this.getById(templateId);
    const stages = template.stages.filter(({ id }) => id !== stageId);
    if (stages.length === template.stages.length) {
      throw new AppError('Workflow stage was not found', 404, 'WORKFLOW_STAGE_NOT_FOUND');
    }
    this.templates.set(templateId, { ...template, stages });
  }

  async reorderStages(templateId: string, stageIds: string[]): Promise<WorkflowStage[]> {
    const template = await this.getById(templateId);
    if (
      stageIds.length !== template.stages.length ||
      stageIds.some((id) => !template.stages.some((stage) => stage.id === id))
    ) {
      throw new AppError('Invalid workflow stage order', 422, 'INVALID_WORKFLOW_STAGE_ORDER');
    }
    const reordered = stageIds.map((id, sortOrder) => {
      const stage = template.stages.find((item) => item.id === id);
      if (!stage) throw new Error('Validated workflow stage was not found');
      return { ...stage, sortOrder };
    });
    this.templates.set(templateId, { ...template, stages: reordered });
    return reordered;
  }

  private clearDefault(applianceTypeId: string | null, exceptId?: string): void {
    for (const [id, template] of this.templates) {
      if (id !== exceptId && template.applianceTypeId === applianceTypeId && template.isDefault) {
        this.templates.set(id, { ...template, isDefault: false });
      }
    }
  }
}

class InMemoryCasesService implements CasesServiceContract {
  readonly cases = new Map<string, CaseRecord>();
  private sequence = 0;
  private stageSequence = 0;

  constructor(private readonly workflowsService: InMemoryWorkflowsService) {}

  async list(input: CaseListInput): Promise<CaseListResult> {
    const filtered = [...this.cases.values()]
      .filter((item) => !input.search || `${item.id} ${item.patientName}`.toLowerCase().includes(input.search.toLowerCase()))
      .filter((item) => !input.priority || item.priority === input.priority)
      .filter((item) => !input.applianceTypeId || item.applianceTypeId === input.applianceTypeId)
      .filter((item) => !input.clinicId || item.clinicId === input.clinicId)
      .filter((item) => !input.stage || item.stage === input.stage)
      .filter((item) => !input.cursor || Number(item.id.slice(3)) > Number(input.cursor))
      .sort((left, right) => left.id.localeCompare(right.id));
    const data = filtered.slice(0, input.limit);
    return {
      data,
      nextCursor: filtered.length > input.limit
        ? String(Number(data[data.length - 1]?.id.slice(3)))
        : null,
      total: filtered.length,
    };
  }

  async getByNumber(caseNumber: string): Promise<CaseRecord> {
    const record = this.cases.get(caseNumber);
    if (!record) throw new AppError('Case was not found', 404, 'CASE_NOT_FOUND');
    return record;
  }

  async create(input: CreateCaseInput, _createdById: string): Promise<CaseRecord> {
    const template = this.workflowsService.templates.get(input.workflowTemplateId);
    if (!template) throw new AppError('Workflow template was not found', 404, 'WORKFLOW_NOT_FOUND');
    const id = `OR-${String(++this.sequence).padStart(6, '0')}`;
    const now = new Date();
    const stages: CaseStage[] = template.stages.map((stage, index) => ({
      id: String(++this.stageSequence),
      sourceStageId: stage.id,
      sortOrder: index,
      name: stage.name,
      slaHours: stage.slaHours,
      requiresApproval: stage.requiresApproval,
      allowedFileKinds: [...stage.allowedFileKinds],
      status: index === 0 ? 'active' : 'pending',
      startedAt: index === 0 ? now : null,
      completedAt: null,
    }));
    const record: CaseRecord = {
      id,
      patientName: input.patientName,
      patientCode: input.patientCode ?? '',
      request: `${input.categoryName ?? 'New case'} · Test appliance`,
      clinicId: input.clinicId ?? null,
      clinicName: 'Portal request',
      doctorId: input.doctorId,
      doctorName: 'Test doctor',
      applianceTypeId: input.applianceTypeId,
      applianceName: 'Test appliance',
      workflowTemplateId: template.id,
      workflowName: template.name,
      categoryId: input.categoryId ?? 'new',
      categoryName: input.categoryName ?? 'New case',
      dueDate: input.dueDate ?? null,
      priority: input.priority,
      priceRule: input.priceRule,
      billable: input.billable,
      originalCaseId: null,
      remakeReason: input.remakeReason ?? null,
      caseFieldValues: input.caseFieldValues ?? {},
      arch: 'Not provided',
      units: 0,
      stage: stages[0]?.name ?? 'Received',
      stages,
      createdAt: now,
      updatedAt: now,
    };
    this.cases.set(record.id, record);
    return record;
  }

  async update(caseNumber: string, input: UpdateCaseInput): Promise<CaseRecord> {
    const current = await this.getByNumber(caseNumber);
    const updated: CaseRecord = {
      ...current,
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      ...(input.caseFieldValues !== undefined ? { caseFieldValues: input.caseFieldValues } : {}),
      updatedAt: new Date(),
    };
    this.cases.set(caseNumber, updated);
    return updated;
  }

  async updateStageStatus(
    caseNumber: string,
    stageId: string,
    status: 'active' | 'completed',
    _actorId: string,
  ): Promise<CaseRecord> {
    const current = await this.getByNumber(caseNumber);
    const index = current.stages.findIndex((stage) => stage.id === stageId);
    if (index < 0) throw new AppError('Case stage was not found', 404, 'CASE_STAGE_NOT_FOUND');
    const now = new Date();
    const stages = current.stages.map((stage) => ({
      ...stage,
      ...(stage.id === stageId
        ? { status, startedAt: stage.startedAt ?? now, completedAt: status === 'completed' ? now : null }
        : stage.status === 'active' ? { status: 'pending' as const, completedAt: null } : {}),
    }));
    if (status === 'completed' && stages[index + 1] && stages[index + 1]?.status !== 'completed') {
      const nextStage = stages[index + 1];
      if (nextStage) stages[index + 1] = { ...nextStage, status: 'active', startedAt: nextStage.startedAt ?? now };
    }
    const updated = {
      ...current,
      stages,
      stage: stages.find((stage) => stage.status === 'active')?.name ?? stages[stages.length - 1]?.name ?? 'Received',
      updatedAt: now,
    };
    this.cases.set(caseNumber, updated);
    return updated;
  }
}

class InMemoryCaseAssetsService implements CaseAssetsServiceContract {
  readonly files = new Map<string, StoredCaseFile>();
  readonly activity: CaseTimelineEntry[] = [];
  private fileSequence = 0;
  private activitySequence = 0;

  constructor(
    private readonly cases: InMemoryCasesService,
    private readonly storage: CaseFileStorage,
  ) {}

  async listFiles(caseNumber: string, kind?: CaseFileKind): Promise<CaseFile[]> {
    this.assertCaseExists(caseNumber);
    return [...this.files.values()]
      .filter((file) => file.caseNumber === caseNumber && (!kind || file.kind === kind))
      .map(({ storagePath: _storagePath, ...file }) => file);
  }

  async uploadFile(
    caseNumber: string,
    stageId: string | null,
    upload: CaseFileUpload,
    actor: CaseActivityActor,
  ): Promise<CaseFile> {
    const caseItem = this.assertCaseExists(caseNumber);
    const stage = stageId ? caseItem.stages.find((item) => item.id === stageId) : undefined;
    if (stageId && !stage) throw new AppError('Case production stage was not found', 404, 'CASE_STAGE_NOT_FOUND');
    const file: StoredCaseFile = {
      id: String(++this.fileSequence),
      caseNumber,
      stageId,
      stageName: stage?.name ?? null,
      name: upload.originalName,
      mimeType: upload.mimeType,
      kind: upload.kind,
      sizeBytes: upload.sizeBytes,
      uploadedBy: actor.fullName,
      createdAt: new Date(),
      storagePath: this.storage.pathForKey(upload.storageKey),
    };
    this.files.set(file.id, file);
    this.addActivity(caseNumber, 'event', `Uploaded ${file.name}`, actor);
    return this.toPublicFile(file);
  }

  async getFile(caseNumber: string, fileId: string): Promise<StoredCaseFile> {
    this.assertCaseExists(caseNumber);
    const file = this.files.get(fileId);
    if (!file || file.caseNumber !== caseNumber) {
      throw new AppError('Case file was not found', 404, 'CASE_FILE_NOT_FOUND');
    }
    return file;
  }

  async renameFile(
    caseNumber: string,
    fileId: string,
    name: string,
    actor: CaseActivityActor,
  ): Promise<CaseFile> {
    const file = await this.getFile(caseNumber, fileId);
    const renamed = { ...file, name };
    this.files.set(fileId, renamed);
    this.addActivity(caseNumber, 'event', `Renamed ${file.name} to ${name}`, actor);
    return this.toPublicFile(renamed);
  }

  async deleteFile(
    caseNumber: string,
    fileId: string,
    actor: CaseActivityActor,
  ): Promise<void> {
    const file = await this.getFile(caseNumber, fileId);
    this.files.delete(fileId);
    this.addActivity(caseNumber, 'event', `Removed ${file.name}`, actor);
    await rm(file.storagePath, { force: true });
  }

  async listActivity(caseNumber: string): Promise<CaseTimelineEntry[]> {
    this.assertCaseExists(caseNumber);
    return this.activity.filter((entry) => entry.message.startsWith(`${caseNumber}:`))
      .map((entry) => ({ ...entry, message: entry.message.slice(caseNumber.length + 1) }));
  }

  async addComment(
    caseNumber: string,
    message: string,
    actor: CaseActivityActor,
  ): Promise<CaseTimelineEntry> {
    this.assertCaseExists(caseNumber);
    return this.addActivity(caseNumber, 'comment', message, actor);
  }

  private assertCaseExists(caseNumber: string): CaseRecord {
    const caseItem = this.cases.cases.get(caseNumber);
    if (!caseItem) throw new AppError('Case was not found', 404, 'CASE_NOT_FOUND');
    return caseItem;
  }

  private addActivity(
    caseNumber: string,
    kind: CaseTimelineEntry['kind'],
    message: string,
    actor: CaseActivityActor,
  ): CaseTimelineEntry {
    const entry: CaseTimelineEntry = {
      id: String(++this.activitySequence),
      kind,
      eventType: kind === 'event' ? 'case_file_changed' : null,
      message: `${caseNumber}:${message}`,
      author: actor.fullName,
      createdAt: new Date(),
    };
    this.activity.push(entry);
    return { ...entry, message };
  }

  private toPublicFile(file: StoredCaseFile): CaseFile {
    const { storagePath: _storagePath, ...publicFile } = file;
    return publicFile;
  }
}

class InMemoryStaffService implements StaffServiceContract {
  readonly staff = new Map<string, StaffMember>([
    ['12', {
      id: '12',
      fullName: 'Lab Admin',
      email: 'admin@example.test',
      phone: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: '1', code: 'owner', name: 'Owner' }],
    }],
  ]);
  private sequence = 12;

  async list(input: StaffListInput): Promise<StaffListResult> {
    const filtered = [...this.staff.values()]
      .filter((member) => input.isActive === undefined || member.isActive === input.isActive)
      .filter((member) =>
        !input.search ||
        `${member.fullName} ${member.email}`.toLowerCase().includes(input.search.toLowerCase()))
      .filter((member) => !input.cursor || BigInt(member.id) > BigInt(input.cursor))
      .sort((left, right) => BigInt(left.id) < BigInt(right.id) ? -1 : 1);
    const data = filtered.slice(0, input.limit);
    return {
      data,
      nextCursor: filtered.length > input.limit ? data[data.length - 1]?.id ?? null : null,
      total: filtered.length,
    };
  }

  async getById(id: string): Promise<StaffMember> {
    const member = this.staff.get(id);
    if (!member) throw new AppError('Staff member was not found', 404, 'STAFF_NOT_FOUND');
    return member;
  }

  async create(input: CreateStaffInput): Promise<StaffMember> {
    if ([...this.staff.values()].some((member) => member.email === input.email)) {
      throw new AppError('A staff member with this email already exists', 409, 'STAFF_EMAIL_EXISTS');
    }
    const roles = this.rolesFor(input.roleIds);
    const now = new Date();
    const member: StaffMember = {
      id: String(++this.sequence),
      fullName: input.fullName,
      email: input.email,
      phone: input.phone ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      roles,
    };
    this.staff.set(member.id, member);
    return member;
  }

  async update(id: string, input: UpdateStaffInput): Promise<StaffMember> {
    const member = await this.getById(id);
    this.assertNotOwner(member);
    if (
      input.email &&
      [...this.staff.values()].some((candidate) => candidate.id !== id && candidate.email === input.email)
    ) {
      throw new AppError('A staff member with this email already exists', 409, 'STAFF_EMAIL_EXISTS');
    }
    const updated: StaffMember = {
      ...member,
      ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.roleIds !== undefined ? { roles: this.rolesFor(input.roleIds) } : {}),
      updatedAt: new Date(),
    };
    this.staff.set(id, updated);
    return updated;
  }

  async setActive(id: string, isActive: boolean, actorId: string): Promise<StaffMember> {
    if (!isActive && id === actorId) {
      throw new AppError('You cannot suspend your own staff account', 409, 'CANNOT_SUSPEND_SELF');
    }
    const member = await this.getById(id);
    this.assertNotOwner(member);
    const updated = { ...member, isActive, updatedAt: new Date() };
    this.staff.set(id, updated);
    return updated;
  }

  async delete(id: string, actorId: string): Promise<void> {
    if (id === actorId) {
      throw new AppError('You cannot delete your own staff account', 409, 'CANNOT_DELETE_SELF');
    }
    const member = await this.getById(id);
    this.assertNotOwner(member);
    this.staff.delete(id);
  }

  private rolesFor(roleIds: string[]) {
    const definitions = [
      { id: '1', code: 'owner', name: 'Owner' },
      { id: '2', code: 'administrator', name: 'Administrator' },
      { id: '3', code: 'developer', name: 'Developer' },
    ];
    const selected = roleIds.map((id) => definitions.find((role) => role.id === id));
    if (selected.some((role) => !role)) {
      throw new AppError('One or more roles were not found', 422, 'STAFF_ROLE_NOT_FOUND');
    }
    if (selected.some((role) => role?.code === 'owner')) {
      throw new AppError('The owner role cannot be assigned through staff management', 409, 'OWNER_ROLE_ASSIGNMENT_DENIED');
    }
    return selected.filter((role) => role !== undefined);
  }

  private assertNotOwner(member: StaffMember): void {
    if (member.roles.some(({ code }) => code === 'owner')) {
      throw new AppError('The account owner cannot be changed through staff management', 409, 'OWNER_STAFF_IMMUTABLE');
    }
  }
}

const auth = new InMemoryAuthService();
const clinics = new InMemoryClinicsService();
const doctors = new InMemoryDoctorsService(clinics);
const appliances = new InMemoryAppliancesService();
const roles = new InMemoryRolesService();
const settings = new InMemorySettingsService();
const staff = new InMemoryStaffService();
const workflows = new InMemoryWorkflowsService();
const cases = new InMemoryCasesService(workflows);
const caseFileStorage = new CaseFileStorage(
  path.join(tmpdir(), `novadontic-case-files-${randomUUID()}`),
);
const caseAssets = new InMemoryCaseAssetsService(cases, caseFileStorage);
let server: Server;
let baseUrl: string;

before(async () => {
  server = createServer(createApp(createApiRoutes(
    auth,
    appliances,
    clinics,
    doctors,
    roles,
    settings,
    staff,
    workflows,
    cases,
    caseAssets,
    caseFileStorage,
  )));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port');
  baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
});

after(async () => {
  server.close();
  await once(server, 'close');
  await rm(caseFileStorage.directory, { recursive: true, force: true });
});

async function signIn(credentials: Record<string, string>) {
  const response = await fetch(`${baseUrl}/auth/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return { response, body: await response.json() as { data: AuthSessionResponse } };
}

describe('single-client auth API', () => {
  it('does not expose tenant or platform-operator endpoints', async () => {
    const tenantEndpoint = await fetch(`${baseUrl}/tenants`);
    const platformEndpoint = await fetch(`${baseUrl}/platform/auth/sessions`);

    assert.equal(tenantEndpoint.status, 404);
    assert.equal(platformEndpoint.status, 404);
  });

  describe('roles and permissions API', () => {
    it('requires authentication and the matching permission', async () => {
      const unauthenticated = await fetch(`${baseUrl}/roles`);
      assert.equal(unauthenticated.status, 401);

      const login = await signIn({ email: user.email, password: 'secret-password' });
      const headers = {
        authorization: login.body.data.accessToken,
        'content-type': 'application/json',
      };
      auth.permissionOverride = ['roles:view'];
      const forbidden = await fetch(`${baseUrl}/roles`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Shift lead', description: 'Leads a shift.' }),
      });
      auth.permissionOverride = undefined;
      assert.equal(forbidden.status, 403);

    });

    it('lists permissions and supports the role lifecycle', async () => {
      const login = await signIn({ email: user.email, password: 'secret-password' });
      const headers = {
        authorization: login.body.data.accessToken,
        'content-type': 'application/json',
      };
      const permissionsResponse = await fetch(`${baseUrl}/roles/permissions?module=doctors`, { headers });
      assert.equal(permissionsResponse.status, 200);
      const permissionsBody = await permissionsResponse.json() as { data: Permission[] };
      assert.ok(permissionsBody.data.some(({ code }) => code === 'doctors:view'));

      const created = await fetch(`${baseUrl}/roles`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Shift lead', description: 'Leads a production shift.' }),
      });
      assert.equal(created.status, 201);
      const createdBody = await created.json() as { data: Role };

      const assigned = await fetch(`${baseUrl}/roles/${createdBody.data.id}/permissions`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ permissionCodes: ['doctors:view'] }),
      });
      assert.equal(assigned.status, 200);
      const assignedBody = await assigned.json() as { data: Role };
      assert.deepEqual(assignedBody.data.permissions, ['doctors:view']);

      const updated = await fetch(`${baseUrl}/roles/${createdBody.data.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ description: 'Leads daily production.' }),
      });
      const updatedBody = await updated.json() as { data: Role };
      assert.equal(updatedBody.data.description, 'Leads daily production.');

      const deleted = await fetch(`${baseUrl}/roles/${createdBody.data.id}`, {
        method: 'DELETE',
        headers,
      });
      assert.equal(deleted.status, 204);

      const protectedSystemRole = await fetch(`${baseUrl}/roles/1`, {
        method: 'DELETE',
        headers,
      });
      assert.equal(protectedSystemRole.status, 409);
    });
  });

  describe('doctors API', () => {
    it('requires authentication for doctor access', async () => {
      const response = await fetch(`${baseUrl}/doctors`);
      assert.equal(response.status, 401);
    });

    it('validates input and supports doctor and clinic association lifecycle', async () => {
      const login = await signIn({ email: user.email, password: 'secret-password' });
      const headers = {
        authorization: login.body.data.accessToken,
        'content-type': 'application/json',
      };
      auth.permissionOverride = ['doctors:view'];
      const forbidden = await fetch(`${baseUrl}/doctors`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ fullName: 'Dr. Unauthorized' }),
      });
      auth.permissionOverride = undefined;
      assert.equal(forbidden.status, 403);

      const clinic = await clinics.create({ name: 'Doctor API Clinic' });
      const invalid = await fetch(`${baseUrl}/doctors`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ fullName: '' }),
      });
      assert.equal(invalid.status, 422);
      const invalidSourceLink = await fetch(`${baseUrl}/doctors`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fullName: 'Dr. Portal',
          source: 'portal',
          clinicIds: [clinic.id],
        }),
      });
      assert.equal(invalidSourceLink.status, 422);

      const created = await fetch(`${baseUrl}/doctors`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fullName: 'Dr. Hana Ibrahim',
          email: 'hana@example.test',
          specialty: 'Orthodontics',
          address: '22 Nile Street',
          country: 'Egypt',
          clinicIds: [clinic.id],
        }),
      });
      assert.equal(created.status, 201);
      const createdBody = await created.json() as { data: Doctor };
      assert.equal(createdBody.data.clinics[0]?.id, clinic.id);

      const filtered = await fetch(`${baseUrl}/doctors?clinicId=${clinic.id}`, { headers });
      assert.equal(filtered.status, 200);
      const filteredBody = await filtered.json() as { data: DoctorListResult };
      assert.equal(filteredBody.data.total, 1);

      const updated = await fetch(`${baseUrl}/doctors/${createdBody.data.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ source: 'portal', isActive: false }),
      });
      assert.equal(updated.status, 200);
      const updatedBody = await updated.json() as { data: Doctor };
      assert.equal(updatedBody.data.source, 'portal');
      assert.equal(updatedBody.data.clinics.length, 0);

      const deleted = await fetch(`${baseUrl}/doctors/${createdBody.data.id}`, {
        method: 'DELETE',
        headers,
      });
      assert.equal(deleted.status, 204);
      const missing = await fetch(`${baseUrl}/doctors/${createdBody.data.id}`, { headers });
      assert.equal(missing.status, 404);
    });
  });

  describe('staff management API', () => {
    it('requires authentication and action-specific permissions', async () => {
      const unauthenticated = await fetch(`${baseUrl}/staff`);
      assert.equal(unauthenticated.status, 401);

      const login = await signIn({ email: user.email, password: 'secret-password' });
      auth.permissionOverride = ['staff:view'];
      const forbidden = await fetch(`${baseUrl}/staff`, {
        method: 'POST',
        headers: {
          authorization: login.body.data.accessToken,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          fullName: 'New staff',
          email: 'new.staff@example.test',
          password: 'long-enough-password',
          roleIds: ['2'],
        }),
      });
      auth.permissionOverride = undefined;
      assert.equal(forbidden.status, 403);

      auth.permissionOverride = ['staff:view'];
      const forbiddenSuspension = await fetch(`${baseUrl}/staff/13/status`, {
        method: 'PATCH',
        headers: {
          authorization: login.body.data.accessToken,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      });
      auth.permissionOverride = undefined;
      assert.equal(forbiddenSuspension.status, 403);
    });

    it('validates input and supports staff and role lifecycle with owner safeguards', async () => {
      const login = await signIn({ email: user.email, password: 'secret-password' });
      const headers = {
        authorization: login.body.data.accessToken,
        'content-type': 'application/json',
      };

      const invalid = await fetch(`${baseUrl}/staff`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fullName: '',
          email: 'not-an-email',
          password: 'short',
          roleIds: [],
        }),
      });
      assert.equal(invalid.status, 422);

      const ownerRole = await fetch(`${baseUrl}/staff`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fullName: 'Second owner',
          email: 'second.owner@example.test',
          password: 'secure-password-123',
          roleIds: ['1'],
        }),
      });
      assert.equal(ownerRole.status, 409);

      const missingRole = await fetch(`${baseUrl}/staff`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fullName: 'Unknown role',
          email: 'unknown.role@example.test',
          password: 'secure-password-123',
          roleIds: ['999'],
        }),
      });
      assert.equal(missingRole.status, 422);

      const created = await fetch(`${baseUrl}/staff`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fullName: 'Sam Staff',
          email: 'SAM.STAFF@example.test',
          password: 'secure-password-123',
          phone: '+1 555 0100',
          roleIds: ['2'],
        }),
      });
      assert.equal(created.status, 201);
      const createdBody = await created.json() as { data: StaffMember };
      assert.equal(createdBody.data.email, 'sam.staff@example.test');
      assert.equal(createdBody.data.roles[0]?.code, 'administrator');
      assert.equal(Object.hasOwn(createdBody.data, 'passwordHash'), false);

      const list = await fetch(`${baseUrl}/staff?search=Sam&isActive=true`, { headers });
      assert.equal(list.status, 200, JSON.stringify(await list.clone().json()));
      const listBody = await list.json() as { data: StaffListResult };
      assert.equal(listBody.data.total, 1);

      const updated = await fetch(`${baseUrl}/staff/${createdBody.data.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          fullName: 'Samuel Staff',
          roleIds: ['3'],
        }),
      });
      assert.equal(updated.status, 200);
      const updatedBody = await updated.json() as { data: StaffMember };
      assert.equal(updatedBody.data.fullName, 'Samuel Staff');
      assert.equal(updatedBody.data.roles[0]?.code, 'developer');

      const suspended = await fetch(`${baseUrl}/staff/${createdBody.data.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive: false }),
      });
      assert.equal(suspended.status, 200);
      const suspendedBody = await suspended.json() as { data: StaffMember };
      assert.equal(suspendedBody.data.isActive, false);

      const selfSuspension = await fetch(`${baseUrl}/staff/12/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive: false }),
      });
      assert.equal(selfSuspension.status, 409);

      const protectedOwnerUpdate = await fetch(`${baseUrl}/staff/12`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ fullName: 'Changed owner' }),
      });
      assert.equal(protectedOwnerUpdate.status, 409);

      const protectedOwnerDelete = await fetch(`${baseUrl}/staff/12`, {
        method: 'DELETE',
        headers,
      });
      assert.equal(protectedOwnerDelete.status, 409);

      const selfDelete = await fetch(`${baseUrl}/staff/12`, {
        method: 'DELETE',
        headers,
      });
      assert.equal(selfDelete.status, 409);

      const reactivated = await fetch(`${baseUrl}/staff/${createdBody.data.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive: true }),
      });
      assert.equal(reactivated.status, 200);

      const deleted = await fetch(`${baseUrl}/staff/${createdBody.data.id}`, {
        method: 'DELETE',
        headers,
      });
      assert.equal(deleted.status, 204);
      const missing = await fetch(`${baseUrl}/staff/${createdBody.data.id}`, { headers });
      assert.equal(missing.status, 404);
    });
  });

  describe('appliances API', () => {
    it('requires authentication to access appliance types', async () => {
      const response = await fetch(`${baseUrl}/appliances`);
      assert.equal(response.status, 401);
    });

    it('validates permissions and supports appliance, group, and field lifecycle', async () => {
      const login = await signIn({ email: user.email, password: 'secret-password' });
      const headers = {
        authorization: login.body.data.accessToken,
        'content-type': 'application/json',
      };

      auth.permissionOverride = ['appliances:view'];
      const forbidden = await fetch(`${baseUrl}/appliances`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Unauthorized type' }),
      });
      auth.permissionOverride = undefined;
      assert.equal(forbidden.status, 403);

      const invalid = await fetch(`${baseUrl}/appliances`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: '' }),
      });
      assert.equal(invalid.status, 422);

      const created = await fetch(`${baseUrl}/appliances`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Night guard' }),
      });
      assert.equal(created.status, 201);
      const createdBody = await created.json() as { data: ApplianceType };
      assert.equal(createdBody.data.code, 'night-guard');
      assert.equal(Object.hasOwn(createdBody.data, 'isSystem'), false);
      assert.equal(Object.hasOwn(createdBody.data, 'sortOrder'), false);

      const groupResponse = await fetch(
        `${baseUrl}/appliances/${createdBody.data.id}/field-groups`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ name: 'Clinical details' }),
        },
      );
      assert.equal(groupResponse.status, 201);
      const groupBody = await groupResponse.json() as { data: ApplianceFieldGroup };

      const fieldResponse = await fetch(
        `${baseUrl}/appliances/${createdBody.data.id}/field-groups/${groupBody.data.id}/fields`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            key: 'arch_type',
            label: 'Arch type',
            type: 'select',
            required: true,
            options: [
              { label: 'Upper', value: 'upper' },
              { label: 'Lower', value: 'lower' },
            ],
          }),
        },
      );
      assert.equal(fieldResponse.status, 201);
      const fieldBody = await fieldResponse.json() as { data: ApplianceField };
      assert.equal(fieldBody.data.options.length, 2);
      assert.equal(fieldBody.data.required, true);

      const updatedFieldResponse = await fetch(
        `${baseUrl}/appliances/${createdBody.data.id}/field-groups/${groupBody.data.id}/fields/${fieldBody.data.id}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ required: false }),
        },
      );
      assert.equal(updatedFieldResponse.status, 200);
      const updatedFieldBody = await updatedFieldResponse.json() as { data: ApplianceField };
      assert.equal(updatedFieldBody.data.required, false);
      assert.equal(updatedFieldBody.data.options.length, 2);

      const groupsResponse = await fetch(
        `${baseUrl}/appliances/${createdBody.data.id}/field-groups`,
        { headers },
      );
      const groupsBody = await groupsResponse.json() as { data: ApplianceFieldGroup[] };
      assert.equal(groupsBody.data.length, 1);

      const invalidType = await fetch(
        `${baseUrl}/appliances/${createdBody.data.id}/field-groups/${groupBody.data.id}/fields`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ key: 'bad', label: 'Bad field', type: 'unsupported' }),
        },
      );
      assert.equal(invalidType.status, 422);

      const typeResponse = await fetch(`${baseUrl}/appliances/${createdBody.data.id}`, { headers });
      const typeBody = await typeResponse.json() as { data: ApplianceType };
      assert.equal(typeBody.data.fieldGroups[0]?.fields[0]?.key, 'arch_type');
      assert.equal(Object.hasOwn(typeBody.data, 'isSystem'), false);

      const groupUpdate = await fetch(
        `${baseUrl}/appliances/${createdBody.data.id}/field-groups/${groupBody.data.id}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ name: 'Updated clinical details' }),
        },
      );
      const updatedGroupBody = await groupUpdate.json() as { data: ApplianceFieldGroup };
      assert.equal(updatedGroupBody.data.name, 'Updated clinical details');

      const activation = await fetch(
        `${baseUrl}/appliances/${createdBody.data.id}/activation`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ isActive: false }),
        },
      );
      const activationBody = await activation.json() as { data: ApplianceType };
      assert.equal(activationBody.data.isActive, false);

      const fieldDelete = await fetch(
        `${baseUrl}/appliances/${createdBody.data.id}/field-groups/${groupBody.data.id}/fields/${fieldBody.data.id}`,
        { method: 'DELETE', headers },
      );
      assert.equal(fieldDelete.status, 204);

      const groupDelete = await fetch(
        `${baseUrl}/appliances/${createdBody.data.id}/field-groups/${groupBody.data.id}`,
        { method: 'DELETE', headers },
      );
      assert.equal(groupDelete.status, 204);

      const typeDelete = await fetch(`${baseUrl}/appliances/${createdBody.data.id}`, {
        method: 'DELETE',
        headers,
      });
      assert.equal(typeDelete.status, 204);
    });
  });

  describe('workflow templates API', () => {
    it('requires authentication to access workflow templates', async () => {
      const response = await fetch(`${baseUrl}/workflows`);
      assert.equal(response.status, 401);
    });

    it('validates permissions and supports template and stage lifecycle operations', async () => {
      const login = await signIn({ email: user.email, password: 'secret-password' });
      const headers = {
        authorization: login.body.data.accessToken,
        'content-type': 'application/json',
      };

      auth.permissionOverride = ['workflows:view'];
      const forbidden = await fetch(`${baseUrl}/workflows`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ applianceTypeId: null, name: 'Forbidden workflow' }),
      });
      auth.permissionOverride = undefined;
      assert.equal(forbidden.status, 403);

      const invalid = await fetch(`${baseUrl}/workflows`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ applianceTypeId: '0', name: '' }),
      });
      assert.equal(invalid.status, 422);

      const created = await fetch(`${baseUrl}/workflows`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          applianceTypeId: null,
          name: 'Standard production',
          isDefault: true,
        }),
      });
      assert.equal(created.status, 201);
      const createdBody = await created.json() as { data: WorkflowTemplate };
      assert.equal(createdBody.data.name, 'Standard production');
      assert.equal(createdBody.data.applianceTypeId, null);
      assert.deepEqual(createdBody.data.stages, []);

      const invalidStage = await fetch(
        `${baseUrl}/workflows/${createdBody.data.id}/stages`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ name: 'Design', allowedFileKinds: ['exe'] }),
        },
      );
      assert.equal(invalidStage.status, 422);

      const firstStageResponse = await fetch(
        `${baseUrl}/workflows/${createdBody.data.id}/stages`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ name: 'Design', requiresApproval: true }),
        },
      );
      assert.equal(firstStageResponse.status, 201);
      const firstStageBody = await firstStageResponse.json() as { data: WorkflowStage };
      assert.equal(firstStageBody.data.sortOrder, 0);
      assert.equal(firstStageBody.data.requiresApproval, true);
      assert.equal(firstStageBody.data.slaHours, null);
      assert.deepEqual(firstStageBody.data.allowedFileKinds, ['stl', 'photo', 'pdf', 'doc']);

      const secondStageResponse = await fetch(
        `${baseUrl}/workflows/${createdBody.data.id}/stages`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: 'Finishing',
            slaHours: 24,
            allowedFileKinds: ['photo'],
          }),
        },
      );
      const secondStageBody = await secondStageResponse.json() as { data: WorkflowStage };

      const reordered = await fetch(
        `${baseUrl}/workflows/${createdBody.data.id}/stages/order`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ stageIds: [secondStageBody.data.id, firstStageBody.data.id] }),
        },
      );
      assert.equal(reordered.status, 200);
      const reorderedBody = await reordered.json() as { data: WorkflowStage[] };
      assert.deepEqual(reorderedBody.data.map(({ id, sortOrder }) => [id, sortOrder]), [
        [secondStageBody.data.id, 0],
        [firstStageBody.data.id, 1],
      ]);

      const updatedStage = await fetch(
        `${baseUrl}/workflows/${createdBody.data.id}/stages/${firstStageBody.data.id}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ name: 'Digital design' }),
        },
      );
      assert.equal(updatedStage.status, 200);
      const updatedStageBody = await updatedStage.json() as { data: WorkflowStage };
      assert.equal(updatedStageBody.data.name, 'Digital design');

      const updatedWorkflow = await fetch(`${baseUrl}/workflows/${createdBody.data.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ name: 'Updated production flow' }),
      });
      assert.equal(updatedWorkflow.status, 200);
      const updatedWorkflowBody = await updatedWorkflow.json() as { data: WorkflowTemplate };
      assert.equal(updatedWorkflowBody.data.name, 'Updated production flow');

      const listed = await fetch(`${baseUrl}/workflows?applianceTypeId=1`, { headers });
      assert.equal(listed.status, 200);
      const listedBody = await listed.json() as { data: WorkflowTemplate[] };
      assert.deepEqual(listedBody.data, []);

      const deletedStage = await fetch(
        `${baseUrl}/workflows/${createdBody.data.id}/stages/${secondStageBody.data.id}`,
        { method: 'DELETE', headers },
      );
      assert.equal(deletedStage.status, 204);

      const deletedWorkflow = await fetch(`${baseUrl}/workflows/${createdBody.data.id}`, {
        method: 'DELETE',
        headers,
      });
      assert.equal(deletedWorkflow.status, 204);
      const missingWorkflow = await fetch(`${baseUrl}/workflows/${createdBody.data.id}`, { headers });
      assert.equal(missingWorkflow.status, 404);
    });
  });

  describe('cases API', () => {
    it('requires authentication to access cases', async () => {
      const response = await fetch(`${baseUrl}/cases`);
      assert.equal(response.status, 401);
    });

    it('creates cases with copied workflow stages and persists stage progress', async () => {
      const login = await signIn({ email: user.email, password: 'secret-password' });
      const headers = {
        authorization: login.body.data.accessToken,
        'content-type': 'application/json',
      };
      const workflow = await workflows.create({
        applianceTypeId: '1',
        name: 'Case snapshot workflow',
        isDefault: false,
      });
      const firstTemplateStage = await workflows.createStage(workflow.id, {
        name: 'Design',
        slaHours: 48,
        requiresApproval: true,
        allowedFileKinds: ['stl', 'pdf'],
      });
      const secondTemplateStage = await workflows.createStage(workflow.id, {
        name: 'Finish',
        slaHours: 24,
        requiresApproval: false,
        allowedFileKinds: ['photo'],
      });

      auth.permissionOverride = ['cases:view'];
      const forbidden = await fetch(`${baseUrl}/cases`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          patientName: 'Test patient',
          doctorId: '1',
          applianceTypeId: '1',
          workflowTemplateId: workflow.id,
        }),
      });
      auth.permissionOverride = undefined;
      assert.equal(forbidden.status, 403);

      const invalid = await fetch(`${baseUrl}/cases`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          patientName: '',
          doctorId: '1',
          applianceTypeId: '1',
          workflowTemplateId: workflow.id,
          dueDate: '2026-02-30',
        }),
      });
      assert.equal(invalid.status, 422);

      const created = await fetch(`${baseUrl}/cases`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          patientName: 'Snapshot patient',
          patientCode: 'PT-9001',
          doctorId: '1',
          applianceTypeId: '1',
          workflowTemplateId: workflow.id,
          categoryId: 'new',
          categoryName: 'New case',
          dueDate: '2026-12-31',
          priority: 'Rush',
          priceRule: 'discounted',
          billable: true,
          caseFieldValues: { arch: 'upper', removable: false, requested_units: ['one', 'two'] },
        }),
      });
      assert.equal(created.status, 201);
      const createdBody = await created.json() as { data: CaseRecord };
      const createdCase = createdBody.data;
      assert.match(createdCase.id, /^OR-\d{6,}$/);
      assert.equal(createdCase.stage, 'Design');
      assert.equal(createdCase.stages.length, 2);
      assert.deepEqual(createdCase.stages.map(({ name, status }) => [name, status]), [
        ['Design', 'active'],
        ['Finish', 'pending'],
      ]);
      assert.equal(createdCase.stages[0]?.sourceStageId, firstTemplateStage.id);
      assert.deepEqual(createdCase.caseFieldValues, {
        arch: 'upper',
        removable: false,
        requested_units: ['one', 'two'],
      });

      await workflows.updateStage(workflow.id, firstTemplateStage.id, { name: 'Digital design' });
      await workflows.deleteStage(workflow.id, secondTemplateStage.id);
      const fetched = await fetch(`${baseUrl}/cases/${createdCase.id}`, { headers });
      assert.equal(fetched.status, 200);
      const fetchedBody = await fetched.json() as { data: CaseRecord };
      assert.deepEqual(fetchedBody.data.stages.map(({ name }) => name), ['Design', 'Finish']);

      auth.permissionOverride = ['cases:view'];
      const forbiddenFileList = await fetch(`${baseUrl}/cases/${createdCase.id}/files`, { headers });
      auth.permissionOverride = undefined;
      assert.equal(forbiddenFileList.status, 403);

      const unsupportedFile = new FormData();
      unsupportedFile.set('file', new Blob(['not allowed']), 'payload.exe');
      const rejectedUpload = await fetch(`${baseUrl}/cases/${createdCase.id}/files`, {
        method: 'POST',
        headers: { authorization: login.body.data.accessToken },
        body: unsupportedFile,
      });
      assert.equal(rejectedUpload.status, 422);

      const upload = new FormData();
      upload.set('stageId', createdCase.stages[0]?.id ?? '');
      upload.set('file', new Blob(['solid model'], { type: 'model/stl' }), 'jaw.stl');
      const uploaded = await fetch(`${baseUrl}/cases/${createdCase.id}/files`, {
        method: 'POST',
        headers: { authorization: login.body.data.accessToken },
        body: upload,
      });
      assert.equal(uploaded.status, 201);
      const uploadedBody = await uploaded.json() as { data: CaseFile };
      assert.equal(uploadedBody.data.kind, 'model');
      assert.equal(uploadedBody.data.stageName, 'Design');

      const filteredFiles = await fetch(
        `${baseUrl}/cases/${createdCase.id}/files?kind=model`,
        { headers },
      );
      const filteredFilesBody = await filteredFiles.json() as { data: CaseFile[] };
      assert.equal(filteredFilesBody.data.length, 1);
      assert.equal(filteredFilesBody.data[0]?.name, 'jaw.stl');

      const downloaded = await fetch(
        `${baseUrl}/cases/${createdCase.id}/files/${uploadedBody.data.id}/download`,
        { headers },
      );
      assert.equal(downloaded.status, 200);
      assert.equal(await downloaded.text(), 'solid model');

      const renamed = await fetch(
        `${baseUrl}/cases/${createdCase.id}/files/${uploadedBody.data.id}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ name: 'jaw-final.stl' }),
        },
      );
      assert.equal(renamed.status, 200);
      const renamedBody = await renamed.json() as { data: CaseFile };
      assert.equal(renamedBody.data.name, 'jaw-final.stl');

      const comment = await fetch(`${baseUrl}/cases/${createdCase.id}/activity`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: 'Setup approved, ready for production.' }),
      });
      assert.equal(comment.status, 201);
      const commentBody = await comment.json() as { data: CaseTimelineEntry };
      assert.equal(commentBody.data.kind, 'comment');
      assert.equal(commentBody.data.author, user.fullName);

      const completed = await fetch(
        `${baseUrl}/cases/${createdCase.id}/stages/${createdCase.stages[0]?.id}/status`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: 'completed' }),
        },
      );
      assert.equal(completed.status, 200);
      const completedBody = await completed.json() as { data: CaseRecord };
      assert.deepEqual(completedBody.data.stages.map(({ status }) => status), [
        'completed',
        'active',
      ]);
      assert.equal(completedBody.data.stage, 'Finish');

      const updated = await fetch(`${baseUrl}/cases/${createdCase.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ priority: 'Normal', dueDate: null }),
      });
      assert.equal(updated.status, 200);
      const updatedBody = await updated.json() as { data: CaseRecord };
      assert.equal(updatedBody.data.priority, 'Normal');
      assert.equal(updatedBody.data.dueDate, null);

      const listed = await fetch(`${baseUrl}/cases?search=Snapshot%20patient&limit=1`, { headers });
      assert.equal(listed.status, 200);
      const listedBody = await listed.json() as { data: CaseListResult };
      assert.equal(listedBody.data.total, 1);
      assert.equal(listedBody.data.data[0]?.id, createdCase.id);

      const deleted = await fetch(
        `${baseUrl}/cases/${createdCase.id}/files/${uploadedBody.data.id}`,
        { method: 'DELETE', headers },
      );
      assert.equal(deleted.status, 204);
      const activityResponse = await fetch(`${baseUrl}/cases/${createdCase.id}/activity`, { headers });
      const activityBody = await activityResponse.json() as { data: CaseTimelineEntry[] };
      assert.ok(activityBody.data.some(({ kind, message }) =>
        kind === 'comment' && message === 'Setup approved, ready for production.',
      ));
      assert.ok(activityBody.data.some(({ message }) => message.includes('Uploaded jaw.stl')));
    });
  });

  describe('clinics API', () => {
    it('requires authentication for clinic access', async () => {
      const response = await fetch(`${baseUrl}/clinics`);
      assert.equal(response.status, 401);
    });

    it('requires the permission for the clinic action', async () => {
      const login = await signIn({ email: user.email, password: 'secret-password' });
      auth.permissionOverride = ['clinics:view'];
      const response = await fetch(`${baseUrl}/clinics`, {
        method: 'POST',
        headers: {
          authorization: login.body.data.accessToken,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Forbidden Clinic' }),
      });
      auth.permissionOverride = undefined;
      assert.equal(response.status, 403);
    });

    describe('settings API', () => {
      it('requires authentication for settings access', async () => {
        const response = await fetch(`${baseUrl}/settings`);
        assert.equal(response.status, 401);
      });

      it('requires the settings read permission', async () => {
        const login = await signIn({ email: user.email, password: 'secret-password' });
        auth.permissionOverride = ['lab_settings:update'];
        const response = await fetch(`${baseUrl}/settings`, {
          headers: { authorization: login.body.data.accessToken },
        });
        auth.permissionOverride = undefined;
        assert.equal(response.status, 403);
      });

      it('lists by group and creates, updates, reads, and deletes settings', async () => {
        const login = await signIn({ email: user.email, password: 'secret-password' });
        const headers = {
          authorization: login.body.data.accessToken,
          'content-type': 'application/json',
        };

        const invalidBody = await fetch(`${baseUrl}/settings/lab.name`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ group: 'general' }),
        });
        assert.equal(invalidBody.status, 422);

        const created = await fetch(`${baseUrl}/settings/lab.name`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ value: 'Novadontic', group: 'general' }),
        });
        assert.equal(created.status, 200);
        const createdBody = await created.json() as { data: Setting };
        assert.equal(createdBody.data.group, 'general');

        const updated = await fetch(`${baseUrl}/settings/lab.name`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ value: 'Novadontic Lab' }),
        });
        const updatedBody = await updated.json() as { data: Setting };
        assert.equal(updatedBody.data.value, 'Novadontic Lab');
        assert.equal(updatedBody.data.group, 'general');

        const ungrouped = await fetch(`${baseUrl}/settings/lab.timezone`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ value: 'Africa/Cairo', group: null }),
        });
        assert.equal(ungrouped.status, 200);

        const list = await fetch(`${baseUrl}/settings?group=general`, { headers });
        assert.equal(list.status, 200);
        const listBody = await list.json() as { data: Setting[] };
        assert.deepEqual(listBody.data.map((setting) => setting.key), ['lab.name']);

        const fetched = await fetch(`${baseUrl}/settings/lab.name`, { headers });
        assert.equal(fetched.status, 200);
        const fetchedBody = await fetched.json() as { data: Setting };
        assert.equal(fetchedBody.data.value, 'Novadontic Lab');

        const deleted = await fetch(`${baseUrl}/settings/lab.name`, {
          method: 'DELETE',
          headers,
        });
        assert.equal(deleted.status, 204);
        const missing = await fetch(`${baseUrl}/settings/lab.name`, { headers });
        assert.equal(missing.status, 404);
      });
    });

    it('validates clinic input and supports clinic lifecycle operations', async () => {
      const login = await signIn({ email: user.email, password: 'secret-password' });
      const headers = {
        authorization: login.body.data.accessToken,
        'content-type': 'application/json',
      };
      const invalid = await fetch(`${baseUrl}/clinics`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: '' }),
      });
      assert.equal(invalid.status, 422);
      const invalidId = await fetch(`${baseUrl}/clinics/9223372036854775808`, { headers });
      assert.equal(invalidId.status, 422);
      const emptyUpdate = await fetch(`${baseUrl}/clinics/1`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({}),
      });
      assert.equal(emptyUpdate.status, 422);

      const created = await fetch(`${baseUrl}/clinics`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Central Clinic', city: 'Cairo' }),
      });
      assert.equal(created.status, 201);
      const createdBody = await created.json() as { data: Clinic };
      assert.equal(createdBody.data.name, 'Central Clinic');

      const fetched = await fetch(`${baseUrl}/clinics/${createdBody.data.id}`, { headers });
      assert.equal(fetched.status, 200);

      const listed = await fetch(`${baseUrl}/clinics?search=central`, { headers });
      assert.equal(listed.status, 200);
      const listBody = await listed.json() as { data: ClinicListResult };
      assert.equal(listBody.data.total, 1);

      const updated = await fetch(`${baseUrl}/clinics/${createdBody.data.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ phone: '+20 123456789' }),
      });
      assert.equal(updated.status, 200);
      const updatedBody = await updated.json() as { data: Clinic };
      assert.equal(updatedBody.data.phone, '+20 123456789');

      const deleted = await fetch(`${baseUrl}/clinics/${createdBody.data.id}`, {
        method: 'DELETE',
        headers,
      });
      assert.equal(deleted.status, 204);
      assert.equal(clinics.clinics.get(createdBody.data.id)?.isActive, false);
    });
  });

  it('signs in by email and password and returns the staff user', async () => {
    const { response, body } = await signIn({
      email: user.email.toUpperCase(),
      password: 'secret-password',
    });

    assert.equal(response.status, 201);
    assert.equal(auth.loginInput?.email, user.email);
    assert.deepEqual(body.data.user.roles, ['admin']);
  });

  it('returns structured errors for invalid request data', async () => {
    const response = await fetch(`${baseUrl}/auth/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'secret-password' }),
    });

    assert.equal(response.status, 422);
    const body = await response.json() as {
      error: { code: string; details: { fieldErrors: Record<string, string[]> } };
    };
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(Object.keys(body.error.details.fieldErrors).length > 0);
  });

  it('uses a raw access token for the current staff user', async () => {
    const anonymous = await fetch(`${baseUrl}/auth/me`);
    assert.equal(anonymous.status, 401);

    const login = await signIn({ email: user.email, password: 'secret-password' });
    const bearerScheme = await fetch(`${baseUrl}/auth/me`, {
      headers: { authorization: `Bearer ${login.body.data.accessToken}` },
    });
    assert.equal(bearerScheme.status, 401);

    const currentUser = await fetch(`${baseUrl}/auth/me`, {
      headers: { authorization: login.body.data.accessToken },
    });
    assert.equal(currentUser.status, 200);
    const body = await currentUser.json() as { data: { email: string } };
    assert.equal(body.data.email, user.email);
  });

  it('rotates refresh credentials and invalidates access after sign-out', async () => {
    const login = await signIn({ email: user.email, password: 'secret-password' });
    const refreshResponse = await fetch(`${baseUrl}/auth/sessions/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: login.body.data.refreshToken }),
    });
    assert.equal(refreshResponse.status, 200);
    const refreshed = await refreshResponse.json() as { data: AuthSessionResponse };
    assert.notEqual(refreshed.data.refreshToken, login.body.data.refreshToken);

    const logoutResponse = await fetch(`${baseUrl}/auth/sessions/current`, {
      method: 'DELETE',
      headers: { authorization: login.body.data.accessToken },
    });
    assert.equal(logoutResponse.status, 204);

    const currentUser = await fetch(`${baseUrl}/auth/me`, {
      headers: { authorization: login.body.data.accessToken },
    });
    assert.equal(currentUser.status, 401);
  });
});
