import { cn } from 'cn'

import { getInitials } from '../../../shared/lib/string/getInitials'

const avatarToneClasses = [
  'bg-primary text-primary-foreground',
  'bg-accent text-accent-foreground',
  'bg-primary-soft text-primary-soft-foreground',
  'bg-accent-soft text-accent-soft-foreground',
]

type PersonAvatarProps = {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export function PersonAvatar({
  name,
  size = 'md',
}: PersonAvatarProps) {
  const initials = getInitials(name)
  const toneIndex = [...name].reduce((total, character) => total + character.charCodeAt(0), 0) % avatarToneClasses.length

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-sm font-semibold',
        size === 'sm' && 'size-9 text-sm',
        size === 'md' && 'size-11 text-base',
        size === 'lg' && 'size-20 rounded-md text-2xl',
        avatarToneClasses[toneIndex],
      )}
    >
      {initials}
    </span>
  )
}
