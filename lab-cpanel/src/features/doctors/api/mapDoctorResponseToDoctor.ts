import type { Doctor } from '../domain/doctor'
import type { DoctorResponse } from './doctorResponse'

export function mapDoctorResponseToDoctor(response: DoctorResponse): Doctor {
  return {
    id: response.id,
    clinicId: response.clinic_id ?? undefined,
    source: response.source,
    name: response.full_name,
    specialty: response.specialty,
    email: response.email_address,
    address: response.address,
    country: response.country,
    phoneNumber: response.phone_number,
    isActive: response.is_active,
    activeCases: response.active_case_count,
    status: response.portal_status,
  }
}
