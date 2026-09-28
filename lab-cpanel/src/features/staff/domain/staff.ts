export type StaffStatus = 'active' | 'suspended'

export type Staff = {
  id: string
  name: string
  email: string
  roleId: string
  status: StaffStatus
  createdAt: string
}

const statusLabels: Record<StaffStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
}

export function getStaffStatusLabel(status: StaffStatus) {
  return statusLabels[status]
}

export function filterStaff(staff: Staff[], searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase()
  if (!normalizedSearch) return staff

  return staff.filter((member) =>
    [member.name, member.email, member.roleId, getStaffStatusLabel(member.status)]
      .some((value) => value.toLowerCase().includes(normalizedSearch)),
  )
}
