import { getInitials } from '../../../shared/lib/string/getInitials'

type PersonAvatarProps = { name: string; size?: 'sm' | 'md' | 'lg' }

export function PersonAvatar({ name, size = 'md' }: PersonAvatarProps) {
  const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-16 text-xl' }
  return <span className={`grid shrink-0 place-items-center rounded-md bg-primary text-primary-foreground font-semibold ${sizes[size]}`}>{getInitials(name)}</span>
}
