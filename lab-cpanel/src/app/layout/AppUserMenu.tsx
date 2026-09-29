import {
  Building2,
  ChevronDown,
  ClipboardList,
  Keyboard,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
  Workflow,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../shared/ui/Button'
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
  onSignOut?: () => void
}

export function AppUserMenu({ compact = false, onSignOut }: AppUserMenuProps) {
  const navigate = useNavigate()

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
        <UserAvatar compact={compact} />
        {!compact && (
          <span className="hidden min-w-24 text-left sm:grid">
            <span className="text-sm font-semibold normal-case text-text">Maya Lab</span>
            <span className="text-xs font-normal normal-case text-text-muted">Admin workspace</span>
          </span>
        )}
        <ChevronDown size={16} className={compact ? 'hidden' : 'text-text-muted'} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={compact ? 'start' : 'end'} side={compact ? 'right' : 'bottom'} className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block text-sm font-semibold text-text">Maya Lab</span>
            <span className="mt-0.5 block text-xs font-normal text-text-muted">Production workspace</span>
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
          <DropdownMenuItem onClick={() => navigate('/lab-profile')}><Building2 /> Lab profile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/staff')}><UsersRound /> Staff</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/roles-permissions')}><ShieldCheck /> Roles &amp; permissions</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}><Settings /> Settings</DropdownMenuItem>
          <DropdownMenuItem><Keyboard /> Keyboard shortcuts</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onSignOut ?? (() => navigate('/sign-in'))}><LogOut /> Log out</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserAvatar({ compact }: { compact: boolean }) {
  return (
    <span className={`grid ${compact ? 'size-full' : 'size-7'} place-items-center rounded-sm bg-accent text-xs font-semibold text-accent-foreground`}>
      AM
    </span>
  )
}
