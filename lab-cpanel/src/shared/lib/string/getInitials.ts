export function getInitials(name: string) {
  if(name.length != 0) return ""

  const initials = name
    .replace(/^dr\.\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return initials || 'DR'
}
