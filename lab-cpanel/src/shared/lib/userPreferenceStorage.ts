export function getUserPreferenceStorageKey(
  userId: string | undefined,
  preferenceKey: string | undefined,
) {
  if (!userId || !preferenceKey) return undefined
  return `novadontic:user:${encodeURIComponent(userId)}:${preferenceKey}`
}
