export type PermissionSubject =
  | 'dashboard'
  | 'cases'
  | 'case_files'
  | 'case_activity'
  | 'production_steps'
  | 'doctors'
  | 'clinics'
  | 'appliances'
  | 'appliance_fields'
  | 'workflows'
  | 'workflow_steps'
  | 'staff'
  | 'roles'
  | 'lab_profile'
  | 'compliance_documents'
  | 'lab_settings'
  | 'account'

export type Permission = `${PermissionSubject}:${string}`

export type RoleType = 'owner' | 'system' | 'custom'

export type PermissionDefinition = {
  id: Permission
  label: string
  description: string
}

export type PermissionGroup = {
  subject: PermissionSubject
  label: string
  permissions: PermissionDefinition[]
}

export type Role = {
  id: string
  name: string
  description: string
  type: RoleType
  permissions: Permission[]
  staffCount: number
}

export const permissionGroups: PermissionGroup[] = [
  {
    subject: 'dashboard',
    label: 'Dashboard',
    permissions: [permission('dashboard:view', 'View dashboard', 'See dashboard statistics and case summaries.')],
  },
  {
    subject: 'cases',
    label: 'Cases',
    permissions: [
      permission('cases:view', 'View cases', 'See cases and case details.'),
      permission('cases:create', 'Create cases', 'Create new lab cases.'),
      permission('cases:update', 'Update cases', 'Edit case information.'),
      permission('cases:delete', 'Delete cases', 'Remove cases from the lab workspace.'),
      permission('cases:approve', 'Approve cases', 'Approve cases before production begins.'),
      permission('cases:move', 'Move cases', 'Move cases through the production pipeline.'),
    ],
  },
  {
    subject: 'case_files',
    label: 'Case files',
    permissions: [
      permission('case_files:view', 'View case files', 'View scans, designs, production files, and shipping documents.'),
      permission('case_files:upload', 'Upload case files', 'Add files to a case or production step.'),
      permission('case_files:download', 'Download case files', 'Download files from a case.'),
      permission('case_files:delete', 'Delete case files', 'Remove files from a case.'),
    ],
  },
  {
    subject: 'case_activity',
    label: 'Case activity',
    permissions: [
      permission('case_activity:view', 'View activity', 'Read case history and activity.'),
      permission('case_activity:add_note', 'Add notes', 'Add internal notes to case activity.'),
    ],
  },
  {
    subject: 'production_steps',
    label: 'Production steps',
    permissions: [
      permission('production_steps:view', 'View production steps', 'See production step progress.'),
      permission('production_steps:assign', 'Assign technicians', 'Assign staff to production steps.'),
      permission('production_steps:update', 'Update production steps', 'Mark steps complete and update progress.'),
    ],
  },
  {
    subject: 'doctors',
    label: 'Doctors',
    permissions: [
      permission('doctors:view', 'View doctors', 'See doctor profiles and related activity.'),
      permission('doctors:create', 'Add doctors', 'Create doctor profiles.'),
      permission('doctors:update', 'Edit doctors', 'Update doctor profiles.'),
      permission('doctors:delete', 'Delete doctors', 'Remove doctors from the lab workspace.'),
      permission('doctors:revoke_access', 'Revoke portal access', 'Revoke doctor portal access.'),
    ],
  },
  {
    subject: 'clinics',
    label: 'Clinics',
    permissions: [
      permission('clinics:view', 'View clinics', 'See clinic profiles and contacts.'),
      permission('clinics:create', 'Add clinics', 'Create clinic profiles.'),
      permission('clinics:update', 'Edit clinics', 'Update clinic information.'),
      permission('clinics:delete', 'Delete clinics', 'Remove clinics from the lab workspace.'),
    ],
  },
  {
    subject: 'appliances',
    label: 'Appliances',
    permissions: [
      permission('appliances:view', 'View appliances', 'See appliance types.'),
      permission('appliances:create', 'Add appliances', 'Create custom appliance types.'),
      permission('appliances:update', 'Edit appliances', 'Rename and update appliance types.'),
      permission('appliances:delete', 'Delete appliances', 'Remove appliance types.'),
      permission('appliances:activate', 'Activate appliances', 'Enable or disable appliance types.'),
    ],
  },
  {
    subject: 'appliance_fields',
    label: 'Appliance fields',
    permissions: [
      permission('appliance_fields:view', 'View fields', 'See appliance field groups and fields.'),
      permission('appliance_fields:create', 'Add fields', 'Create fields and field groups.'),
      permission('appliance_fields:update', 'Edit fields', 'Edit field configuration and options.'),
      permission('appliance_fields:delete', 'Delete fields', 'Remove fields and field groups.'),
    ],
  },
  {
    subject: 'workflows',
    label: 'Workflow templates',
    permissions: [
      permission('workflows:view', 'View workflows', 'See workflow templates.'),
      permission('workflows:create', 'Add workflows', 'Create workflow templates.'),
      permission('workflows:update', 'Edit workflows', 'Update workflow settings.'),
      permission('workflows:delete', 'Delete workflows', 'Remove workflow templates.'),
    ],
  },
  {
    subject: 'workflow_steps',
    label: 'Workflow steps',
    permissions: [
      permission('workflow_steps:create', 'Add workflow steps', 'Add production steps to workflows.'),
      permission('workflow_steps:update', 'Edit workflow steps', 'Edit production step details.'),
      permission('workflow_steps:delete', 'Delete workflow steps', 'Remove production steps.'),
      permission('workflow_steps:reorder', 'Reorder workflow steps', 'Change the production step order.'),
    ],
  },
  {
    subject: 'staff',
    label: 'Staff',
    permissions: [
      permission('staff:view', 'View staff', 'See staff members and access status.'),
      permission('staff:create', 'Add staff', 'Create staff members.'),
      permission('staff:update', 'Edit staff', 'Update staff profiles and roles.'),
      permission('staff:delete', 'Delete staff', 'Remove staff members.'),
      permission('staff:suspend', 'Suspend staff access', 'Suspend or restore workspace access.'),
    ],
  },
  {
    subject: 'roles',
    label: 'Roles & permissions',
    permissions: [
      permission('roles:view', 'View roles', 'See roles and their selected permissions.'),
      permission('roles:create', 'Add roles', 'Create custom roles.'),
      permission('roles:update', 'Edit roles', 'Edit role details and permissions.'),
      permission('roles:delete', 'Delete roles', 'Remove custom roles.'),
      permission('roles:manage_permissions', 'Manage permissions', 'Select permissions for roles.'),
    ],
  },
  {
    subject: 'lab_profile',
    label: 'Lab profile',
    permissions: [
      permission('lab_profile:view', 'View lab profile', 'See lab identity and account information.'),
      permission('lab_profile:update', 'Edit lab profile', 'Update business details.'),
      permission('lab_profile:export', 'Export account data', 'Request an account data export.'),
      permission('lab_profile:manage_subscription', 'Manage subscription', 'Manage the lab plan.'),
    ],
  },
  {
    subject: 'compliance_documents',
    label: 'Compliance documents',
    permissions: [
      permission('compliance_documents:view', 'View requirements', 'See administrator-defined compliance requirements.'),
      permission('compliance_documents:upload', 'Upload documents', 'Provide required compliance documents.'),
      permission('compliance_documents:replace', 'Replace documents', 'Replace provided compliance documents.'),
    ],
  },
  {
    subject: 'lab_settings',
    label: 'Lab settings',
    permissions: [
      permission('lab_settings:view', 'View lab settings', 'See operations and notification settings.'),
      permission('lab_settings:update', 'Edit lab settings', 'Update lab operations and notifications.'),
    ],
  },
  {
    subject: 'account',
    label: 'Account',
    permissions: [
      permission('account:manage_owner', 'Manage account owner', 'Transfer ownership and manage owner access.'),
      permission('account:suspend', 'Suspend account', 'Suspend the lab account.'),
      permission('account:close', 'Close account', 'Permanently close the lab account.'),
      permission('account:export', 'Export all data', 'Export all lab data.'),
    ],
  },
]

export function getAllPermissions() {
  return permissionGroups.flatMap((group) => group.permissions.map((item) => item.id))
}

export function getVisibleRoles(roles: Role[]) {
  return roles.filter((role) => role.type !== 'owner')
}

export function hasRolePermission(role: Role, permission: Permission) {
  return role.type === 'owner' || role.permissions.includes(permission)
}

export function hasAnyRolePermission(
  role: Role,
  permissions: readonly Permission[],
) {
  return permissions.some((permission) => hasRolePermission(role, permission))
}

export function hasAllRolePermissions(
  role: Role,
  permissions: readonly Permission[],
) {
  return permissions.every((permission) => hasRolePermission(role, permission))
}

function permission(id: Permission, label: string, description: string): PermissionDefinition {
  return { id, label, description }
}
