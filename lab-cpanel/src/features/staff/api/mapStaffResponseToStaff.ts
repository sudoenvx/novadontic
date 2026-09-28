import type { StaffResponse } from './staffResponse'
import type { Staff } from '../domain/staff'

export function mapStaffResponseToStaff(response: StaffResponse): Staff {
  return {
    id: response.id,
    name: response.full_name,
    email: response.email_address,
    roleId: response.role_id,
    status: response.status,
    createdAt: response.created_at,
  }
}
