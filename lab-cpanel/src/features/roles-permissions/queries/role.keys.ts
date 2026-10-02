export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (search?: string) => [...roleKeys.lists(), search] as const,
  permissions: () => [...roleKeys.all, 'permissions'] as const,
}
