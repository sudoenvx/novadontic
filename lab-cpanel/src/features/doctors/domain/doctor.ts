export type DoctorStatus = 'active' | 'pending' | 'inactive'
export type DoctorSource = 'clinic' | 'portal'

export type Doctor = {
  id: string
  clinicId?: string
  source: DoctorSource
  name: string
  specialty: string
  email: string
  address: string
  country: string
  phoneNumber: string
  isActive: boolean
  activeCases: number
  status: DoctorStatus
}

export function getDoctorsForClinic(clinicId: string, doctors: Doctor[]) {
  return doctors.filter((doctor) => doctor.clinicId === clinicId)
}

export function filterDoctors(
  doctors: Doctor[],
  clinics: Array<{ id: string; name: string }>,
  searchTerm: string,
) {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  if (!normalizedSearch) return doctors

  return doctors.filter((doctor) => {
    const clinic = clinics.find((item) => item.id === doctor.clinicId)
    const searchableValues = [doctor.name, doctor.specialty, doctor.email, clinic?.name]
      .filter((value): value is string => Boolean(value))

    return searchableValues.some((value) => value.toLowerCase().includes(normalizedSearch))
  })
}
