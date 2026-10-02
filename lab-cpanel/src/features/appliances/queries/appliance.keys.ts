export const applianceKeys = {
  all: ['appliances'] as const,
  lists: () => [...applianceKeys.all, 'list'] as const,
  list: (params: { search?: string; isActive?: boolean } = {}) =>
    [...applianceKeys.lists(), params] as const,
  details: () => [...applianceKeys.all, 'detail'] as const,
  detail: (applianceTypeId: string) =>
    [...applianceKeys.details(), applianceTypeId] as const,
}
