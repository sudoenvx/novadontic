export type DoctorSource = 'clinic' | 'portal'

export type DoctorClinic = {
  id: string
  name: string
}

export type Doctor = {
  id: string
  fullName: string
  source: DoctorSource
  specialty: string | null
  email: string | null
  phone: string | null
  address: string | null
  country: string | null
  notes: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  clinics: DoctorClinic[]
}

export type DoctorInput = {
  fullName: string
  email?: string | null
  phone?: string | null
  address?: string | null
  country?: string | null
  specialty?: string | null
  notes?: string | null
  source?: DoctorSource
  isActive?: boolean
  clinicIds?: string[]
}

export type DoctorUpdateInput = Partial<DoctorInput>

export function getDoctorsForClinic(clinicId: string, doctors: Doctor[]) {
  return doctors.filter((doctor) =>
    doctor.clinics.some((clinic) => clinic.id === clinicId),
  )
}

export function filterDoctors(
  doctors: Doctor[],
  searchTerm: string,
) {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  if (!normalizedSearch) return doctors

  return doctors.filter((doctor) => {
    const searchableValues: Array<string | null> = [
      doctor.fullName,
      doctor.specialty,
      doctor.email,
      ...doctor.clinics.map((clinic) => clinic.name),
    ]
      .filter((value): value is string => value !== null)

    return searchableValues.some((value) =>
      value?.toLowerCase().includes(normalizedSearch),
    )
  })
}
