import type { StaffStatus } from '../domain/staff'

export type StaffResponse = {
  id: string
  full_name: string
  email_address: string
  role_id: string
  status: StaffStatus
  created_at: string
}
