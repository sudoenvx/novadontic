import type { ClinicResponse } from '../api/clinicResponse'
import { mapClinicResponseToClinic } from '../api/mapClinicResponseToClinic'

const clinicResponses: ClinicResponse[] = [
  { id: 'smile-studio', name: 'Smile Studio', address: '12 Tahrir St, Cairo', phone: '+20 100 111 2222', email: 'hello@smilestudio.eg' },
  { id: 'adel-ortho', name: 'Adel Ortho', address: '4 Gezira St, Giza', phone: '+20 100 231 4412', email: 'hello@adelortho.eg' },
  { id: 'bright-dental', name: 'Bright Dental', address: '19 Corniche Rd, Alexandria', phone: '+20 100 882 1350', email: 'hello@brightdental.eg' },
  { id: 'ezzat-clinic', name: 'Ezzat Clinic', address: '7 Mostafa St, Mansoura', phone: '+20 100 772 9104', email: 'hello@ezzatclinic.eg' },
]

export const clinicFixtures = clinicResponses.map(mapClinicResponseToClinic)
