import type {
  CreateStaffInput,
  Staff,
  UpdateStaffInput,
} from '../domain/staff'
import type {
  StaffDto,
  StaffInputDto,
  StaffUpdateDto,
} from './staff.dto'

export function mapStaffDtoToStaff(response: StaffDto): Staff {
  return {
    ...response,
    createdAt: new Date(response.createdAt),
    updatedAt: new Date(response.updatedAt),
  }
}

export function mapStaffInputToDto(input: CreateStaffInput): StaffInputDto {
  return { ...input }
}

export function mapStaffUpdateInputToDto(input: UpdateStaffInput): StaffUpdateDto {
  return { ...input }
}
