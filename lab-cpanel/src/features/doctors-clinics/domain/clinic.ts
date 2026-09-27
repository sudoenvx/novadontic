import type { Doctor } from './doctor'

export type Clinic = {
  id: string
  name: string
  address: string
  phone: string
  billingEmail: string
}

export function filterClinics(
  clinics: Clinic[],
  doctors: Doctor[],
  searchTerm: string,
) {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  if (!normalizedSearch) {
    return clinics
  }

  return clinics.filter((clinic) => {
    const clinicDoctors = doctors.filter((doctor) => doctor.clinicId === clinic.id)

    return (
      clinic.name.toLowerCase().includes(normalizedSearch) ||
      clinic.address.toLowerCase().includes(normalizedSearch) ||
      clinicDoctors.some((doctor) => doctor.name.toLowerCase().includes(normalizedSearch))
    )
  })
}
