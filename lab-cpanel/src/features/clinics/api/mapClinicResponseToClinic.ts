import type { Clinic } from '../domain/clinic'
import type { ClinicResponse } from './clinicResponse'

export function mapClinicResponseToClinic(response: ClinicResponse): Clinic {
  return {
    id: response.id,
    name: response.name,
    address: response.address,
    phone: response.phone,
    email: response.email,
  }
}
