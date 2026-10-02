import type { StaffListParams } from '../domain/staff'

export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (params: StaffListParams) => [...staffKeys.lists(), params] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (staffId: string) => [...staffKeys.details(), staffId] as const,
  roles: () => [...staffKeys.all, 'assignable-roles'] as const,
}
