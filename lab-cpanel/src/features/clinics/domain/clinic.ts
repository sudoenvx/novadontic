export type ClinicDoctor = {
  id: string
  fullName: string
  email: string | null
  specialty: string | null
  isActive: boolean
}

export type Clinic = {
  id: string
  name: string
  legalName: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  city: string | null
  notes: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  doctors: ClinicDoctor[]
}

export type ClinicOption = Pick<Clinic, 'id' | 'name'>

export type ClinicInput = {
  name: string
  legalName?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  address?: string | null
  city?: string | null
  notes?: string | null
  isActive?: boolean
  doctorIds?: string[]
}

export function filterClinics(clinics: Clinic[], searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  if (!normalizedSearch) return clinics

  return clinics.filter((clinic) => {
    const searchableValues = [
      clinic.name,
      clinic.legalName,
      clinic.email,
      clinic.phone,
      clinic.website,
      clinic.address,
      clinic.city,
      ...clinic.doctors.map((doctor) => doctor.fullName),
    ]

    return searchableValues.some((value) =>
      value?.toLowerCase().includes(normalizedSearch),
    )
  })
}
