export const clinicKeys = {
  all: ['clinics'] as const,
  lists: () => [...clinicKeys.all, 'list'] as const,
  list: (params: { search?: string; isActive?: boolean } = {}) =>
    [...clinicKeys.lists(), params] as const,
  details: () => [...clinicKeys.all, 'detail'] as const,
  detail: (clinicId: string) => [...clinicKeys.details(), clinicId] as const,
  options: () => [...clinicKeys.all, 'options'] as const,
}
