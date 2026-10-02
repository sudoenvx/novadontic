import type {
  Doctor,
  DoctorInput,
  DoctorUpdateInput,
} from '../domain/doctor'
import type {
  DoctorInputDto,
  DoctorResponseDto,
  DoctorUpdateDto,
} from './doctor.dto'

export function mapDoctorResponseDtoToDoctor(
  response: DoctorResponseDto,
): Doctor {
  return {
    ...response,
    createdAt: new Date(response.createdAt),
    updatedAt: new Date(response.updatedAt),
  }
}

export function mapDoctorInputToDto(input: DoctorInput): DoctorInputDto {
  return {
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    address: input.address,
    country: input.country,
    specialty: input.specialty,
    notes: input.notes,
    source: input.source,
    isActive: input.isActive,
    clinicIds: input.clinicIds,
  }
}

export function mapDoctorUpdateInputToDto(
  input: DoctorUpdateInput,
): DoctorUpdateDto {
  return input
}
