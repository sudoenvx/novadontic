import type { Clinic } from '../../clinics/domain/clinic'

const createdAt = new Date('2025-01-01T00:00:00.000Z')

export const clinicFixtures: Clinic[] = [
  { id: 'smile-studio', name: 'Smile Studio', legalName: null, address: '12 Tahrir St, Cairo', city: 'Cairo', phone: '+20 100 111 2222', email: 'hello@smilestudio.eg', website: null, notes: null, isActive: true, createdAt, updatedAt: createdAt, doctors: [] },
  { id: 'adel-ortho', name: 'Adel Ortho', legalName: null, address: '4 Gezira St, Giza', city: 'Giza', phone: '+20 100 231 4412', email: 'hello@adelortho.eg', website: null, notes: null, isActive: true, createdAt, updatedAt: createdAt, doctors: [] },
  { id: 'bright-dental', name: 'Bright Dental', legalName: null, address: '19 Corniche Rd, Alexandria', city: 'Alexandria', phone: '+20 100 882 1350', email: 'hello@brightdental.eg', website: null, notes: null, isActive: true, createdAt, updatedAt: createdAt, doctors: [] },
  { id: 'ezzat-clinic', name: 'Ezzat Clinic', legalName: null, address: '7 Mostafa St, Mansoura', city: 'Mansoura', phone: '+20 100 772 9104', email: 'hello@ezzatclinic.eg', website: null, notes: null, isActive: true, createdAt, updatedAt: createdAt, doctors: [] },
]
