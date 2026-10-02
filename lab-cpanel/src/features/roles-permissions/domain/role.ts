export type Permission = string
export type RoleType = 'owner' | 'system' | 'custom'

export type PermissionDefinition = {
  id: Permission
  label: string
  description: string
}

export type PermissionGroup = {
  subject: string
  label: string
  permissions: PermissionDefinition[]
}

export type Role = {
  id: string
  code: string
  name: string
  description: string
  type: RoleType
  isSystem: boolean
  permissions: Permission[]
  staffCount: number
}

export type RolePermission = {
  code: Permission
  module: string
  description: string | null
}

const moduleLabels: Record<string, string> = {
  case_activity: 'Case activity',
  case_files: 'Case files',
  compliance_documents: 'Compliance documents',
  lab_profile: 'Lab profile',
  lab_settings: 'Lab settings',
  production_steps: 'Production steps',
  workflow_steps: 'Workflow steps',
}

export function groupRolePermissions(
  permissions: RolePermission[],
): PermissionGroup[] {
  const groups = new Map<string, PermissionGroup>()

  for (const permission of permissions) {
    const group = groups.get(permission.module) ?? {
      subject: permission.module,
      label: moduleLabels[permission.module] ?? formatLabel(permission.module),
      permissions: [],
    }
    const action = permission.code.split(':').at(-1) ?? permission.code
    group.permissions.push({
      id: permission.code,
      label: permission.description ?? formatLabel(action),
      description: permission.description ? '' : permission.code,
    })
    groups.set(permission.module, group)
  }

  return [...groups.values()]
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

function formatLabel(value: string) {
  return value
    .replace(/[_:.-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}
