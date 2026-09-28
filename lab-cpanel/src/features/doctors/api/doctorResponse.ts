import type { DoctorSource, DoctorStatus } from '../domain/doctor'

export type DoctorResponse = {
  id: string
  clinic_id: string | null
  source: DoctorSource
  full_name: string
  specialty: string
  email_address: string
  address: string
  country: string
  phone_number: string
  is_active: boolean
  active_case_count: number
  portal_status: DoctorStatus
}
