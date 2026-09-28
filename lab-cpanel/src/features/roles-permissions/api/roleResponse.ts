import type { Permission, RoleType } from '../domain/role'

export type RoleResponse = {
  id: string
  name: string
  description: string
  type: RoleType
  permission_codes: Permission[]
  staff_count: number
}
