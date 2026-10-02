export const caseKeys = {
  all: ['cases'] as const,
  list: (search?: string) => search
    ? [...caseKeys.all, 'list', { search }] as const
    : [...caseKeys.all, 'list'] as const,
  detail: (caseNumber: string) => [...caseKeys.all, 'detail', caseNumber] as const,
}
