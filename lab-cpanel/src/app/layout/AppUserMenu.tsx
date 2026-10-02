import {
  Building2,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
  Workflow,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { getApiErrorMessage, isUnauthorizedApiError } from '../../shared/api/apiError'
import { Button } from '../../shared/ui/Button'
import { useAuth } from '../../features/auth/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../shared/ui/DropdownMenu'

type AppUserMenuProps = {
  compact?: boolean
}

export function AppUserMenu({ compact = false }: AppUserMenuProps) {
  const navigate = useNavigate()
  const { session, signOut } = useAuth()
  const fullName = session?.user.fullName ?? 'Account'
  const roleLabel = session?.user.roles.join(', ') || 'Lab workspace'
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'NA'

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/sign-in', { replace: true })
    } catch (error) {
      if (isUnauthorizedApiError(error)) {
        navigate('/sign-in', { replace: true })
        return
      }

      navigate('/sign-in', {
        replace: true,
        state: {
          authError: getApiErrorMessage(error, 'Unable to end your session.'),
        },
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="transparent"
            size={compact ? 'icon-sm' : 'sm'}
            className={compact ? 'size-8! border-0 p-0' : 'gap-2 px-1.5'}
            aria-label="Open account menu"
          />
        }
      >
        <UserAvatar compact={compact} initials={initials} />
        {!compact && (
          <span className="hidden min-w-24 text-left sm:grid">
            <span className="text-sm font-semibold normal-case text-text">{fullName}</span>
            <span className="text-xs font-normal normal-case text-text-muted">{roleLabel}</span>
          </span>
        )}
        <ChevronDown size={16} className={compact ? 'hidden' : 'text-text-muted'} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={compact ? 'start' : 'end'} side={compact ? 'right' : 'bottom'} className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block text-sm font-semibold text-text">{fullName}</span>
            <span className="mt-0.5 block text-xs font-normal text-text-muted">{session?.user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Workspace</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate('/')}><LayoutDashboard /> Dashboard</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/cases')}><ClipboardList /> Cases</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/doctors')}><Building2 /> Doctors</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/clinics')}><Building2 /> Clinics</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/appliances')}><SlidersHorizontal /> Appliances &amp; fields</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/appliance-workflow-templates')}><Workflow /> Workflow templates</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate('/staff')}><UsersRound /> Staff</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/roles-permissions')}><ShieldCheck /> Roles &amp; permissions</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}><Settings /> Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => void handleSignOut()}><LogOut /> Log out</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserAvatar({ compact, initials }: { compact: boolean; initials: string }) {
  return (
    <span className={`grid ${compact ? 'size-full' : 'size-7'} place-items-center rounded-sm bg-accent text-xs font-semibold text-accent-foreground`}>
      {initials}
    </span>
  )
}
