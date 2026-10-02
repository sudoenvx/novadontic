import type { Clinic, ClinicInput, ClinicOption } from '../domain/clinic'
import type {
  ClinicInputDto,
  ClinicOptionResponseDto,
  ClinicResponseDto,
  ClinicUpdateDto,
} from './clinic.dto'

export function mapClinicResponseDtoToClinic(
  response: ClinicResponseDto,
): Clinic {
  return {
    ...response,
    createdAt: new Date(response.createdAt),
    updatedAt: new Date(response.updatedAt),
  }
}

export function mapClinicOptionResponseDtoToClinicOption(
  response: ClinicOptionResponseDto,
): ClinicOption {
  return {
    id: response.id,
    name: response.name,
  }
}

export function mapClinicInputToDto(input: ClinicInput): ClinicInputDto {
  return {
    name: input.name,
    legalName: input.legalName,
    email: input.email,
    phone: input.phone,
    website: input.website,
    address: input.address,
    city: input.city,
    notes: input.notes,
    isActive: input.isActive,
    doctorIds: input.doctorIds,
  }
}

export function mapClinicUpdateInputToDto(
  input: Partial<ClinicInput>,
): ClinicUpdateDto {
  return {
    name: input.name,
    legalName: input.legalName,
    email: input.email,
    phone: input.phone,
    website: input.website,
    address: input.address,
    city: input.city,
    notes: input.notes,
    isActive: input.isActive,
    doctorIds: input.doctorIds,
  }
}
