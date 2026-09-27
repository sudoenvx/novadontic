export type DoctorCaseStatus = 'In production' | 'Quality check' | 'Delivered' | 'Needs attention'

export type DoctorCaseHistory = {
  id: string
  patientName: string
  applianceType: string
  stage: string
  status: DoctorCaseStatus
  updatedAt: string
}

export type DoctorDetails = {
  doctorId: string
  memberSince: string
  totalCases: number
  onTimeRate: string
  averageTurnaround: string
  caseHistory: DoctorCaseHistory[]
}

export function createDoctorDetails(doctor: Pick<Doctor, 'id' | 'activeCases'>): DoctorDetails {
  return {
    doctorId: doctor.id,
    memberSince: 'New profile',
    totalCases: doctor.activeCases,
    onTimeRate: '—',
    averageTurnaround: '—',
    caseHistory: [],
  }
}
import type { Doctor } from './doctor'
