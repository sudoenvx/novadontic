import { getAllPermissions, permissionGroups } from '../domain/role'
import type { RoleResponse } from '../api/roleResponse'
import { mapRoleResponseToRole } from '../api/mapRoleResponseToRole'

const allPermissions = getAllPermissions()
const technicianPermissions = permissionGroups
  .filter((group) => ['dashboard', 'cases', 'case_files', 'case_activity', 'production_steps', 'appliances', 'appliance_fields', 'workflows', 'workflow_steps'].includes(group.subject))
  .flatMap((group) => group.permissions.map((item) => item.id))

const roleResponses: RoleResponse[] = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'The single account owner with unrestricted access.',
    type: 'owner',
    permission_codes: [],
    staff_count: 1,
  },
  {
    id: 'administrator',
    name: 'Administrator',
    description: 'Manage the lab workspace, people, and day-to-day operations.',
    type: 'system',
    permission_codes: allPermissions,
    staff_count: 1,
  },
  {
    id: 'technician',
    name: 'Technician',
    description: 'Work on assigned production steps and case files.',
    type: 'system',
    permission_codes: technicianPermissions,
    staff_count: 2,
  },
]

export const roleFixtures = roleResponses.map(mapRoleResponseToRole)
