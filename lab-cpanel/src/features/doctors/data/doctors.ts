import type { DoctorResponse } from '../api/doctorResponse'
import { mapDoctorResponseToDoctor } from '../api/mapDoctorResponseToDoctor'

const doctorResponses: DoctorResponse[] = [
  {
    id: 'nour-hassan', clinic_id: 'smile-studio', source: 'clinic', full_name: 'Dr. Nour Hassan', specialty: 'Orthodontics',
    email_address: 'nour@smilestudio.eg', address: '12 Tahrir St, Cairo', country: 'Egypt', phone_number: '+20 100 111 2222', is_active: true, active_case_count: 6, portal_status: 'active',
  },
  {
    id: 'yara-sabry', clinic_id: 'smile-studio', source: 'clinic', full_name: 'Dr. Yara Sabry', specialty: 'Pediatric dentistry',
    email_address: 'yara@smilestudio.eg', address: '12 Tahrir St, Cairo', country: 'Egypt', phone_number: '+20 100 222 3333', is_active: true, active_case_count: 1, portal_status: 'pending',
  },
  {
    id: 'karim-adel', clinic_id: 'adel-ortho', source: 'clinic', full_name: 'Dr. Karim Adel', specialty: 'Orthodontics',
    email_address: 'karim@adelortho.eg', address: '4 Gezirat St, Giza', country: 'Egypt', phone_number: '+20 100 333 4444', is_active: true, active_case_count: 4, portal_status: 'active',
  },
  {
    id: 'salma-fathy', clinic_id: 'bright-dental', source: 'clinic', full_name: 'Dr. Salma Fathy', specialty: 'Orthodontics',
    email_address: 'salma@brightdental.eg', address: '19 Corniche Rd, Alexandria', country: 'Egypt', phone_number: '+20 100 444 5555', is_active: true, active_case_count: 3, portal_status: 'active',
  },
  {
    id: 'tamer-fouad', clinic_id: null, source: 'portal', full_name: 'Dr. Tamer Fouad', specialty: 'General dentistry',
    email_address: 'tamer@brightdental.eg', address: '19 Corniche Rd, Alexandria', country: 'Egypt', phone_number: '+20 100 555 6666', is_active: false, active_case_count: 0, portal_status: 'inactive',
  },
  {
    id: 'mona-ezzat', clinic_id: 'ezzat-clinic', source: 'clinic', full_name: 'Dr. Mona Ezzat', specialty: 'Prosthodontics',
    email_address: 'mona@ezzatclinic.eg', address: '7 Mostafa St, Mansoura', country: 'Egypt', phone_number: '+20 100 666 7777', is_active: true, active_case_count: 2, portal_status: 'pending',
  },
]

export const doctorFixtures = doctorResponses.map(mapDoctorResponseToDoctor)
