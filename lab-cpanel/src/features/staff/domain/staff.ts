export type StaffRole = {
  id: string
  code: string
  name: string
}

export type StaffStatus = 'active' | 'suspended'

export type Staff = {
  id: string
  fullName: string
  email: string
  phone: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  roles: StaffRole[]
}

export type CreateStaffInput = {
  fullName: string
  email: string
  password: string
  phone?: string | null
  roleIds: string[]
}

export type UpdateStaffInput = {
  fullName?: string
  email?: string
  phone?: string | null
  roleIds?: string[]
}

export type StaffListParams = {
  search?: string
  isActive?: boolean
  limit?: number
  cursor?: string
}

export function getStaffStatus(staff: Staff): StaffStatus {
  return staff.isActive ? 'active' : 'suspended'
}

export function getStaffStatusLabel(status: StaffStatus) {
  return status === 'active' ? 'Active' : 'Suspended'
}

export function isOwner(staff: Staff) {
  return staff.roles.some((role) => role.code === 'owner')
}

export function filterStaff(staff: Staff[], searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase()
  if (!normalizedSearch) return staff

  return staff.filter((member) =>
    [
      member.fullName,
      member.email,
      member.phone ?? '',
      ...member.roles.map((role) => role.name),
      getStaffStatusLabel(getStaffStatus(member)),
    ].some((value) => value.toLowerCase().includes(normalizedSearch)),
  )
}
