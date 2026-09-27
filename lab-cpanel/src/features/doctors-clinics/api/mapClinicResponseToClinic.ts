import type { ClinicResponse } from './clinicResponse'
import type { Clinic } from '../domain/clinic'

export function mapClinicResponseToClinic(response: ClinicResponse): Clinic {
  return {
    id: response.id,
    name: response.name,
    address: response.address,
    phone: response.phone,
    billingEmail: response.billing_email,
  }
}
