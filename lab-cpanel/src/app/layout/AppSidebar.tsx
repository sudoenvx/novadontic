import { Building2, ClipboardList, Home, Settings, SlidersHorizontal, Workflow } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../shared/ui/Tooltip'
import { AppUserMenu } from './AppUserMenu'

const navigationItems = [
  { label: 'Dashboard', path: '/', icon: Home, end: true },
  { label: 'Case pipeline', path: '/cases', icon: ClipboardList },
  { label: 'Doctors & clinics', path: '/doctors-clinics', icon: Building2 },
  { label: 'Appliances & fields', path: '/appliances', icon: SlidersHorizontal },
  { label: 'Workflow templates', path: '/appliance-workflow-templates', icon: Workflow },
  { label: 'Lab settings', path: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <TooltipProvider>
      <aside className="fixed top-1/2 left-2 z-40 hidden -translate-y-1/2 rounded-md bg-surface p-1.5 shadow-sm  md:block" aria-label="Primary navigation">
        <div className="grid gap-2">
          <nav className="grid gap-1">
            {navigationItems.map(({ end, icon: Icon, label, path }) => {
              const isActive = end ? pathname === path : pathname.startsWith(path)

              return (
                <Tooltip key={path}>
                  <TooltipTrigger
                    render={
                      <NavLink
                        to={path}
                        end={end}
                        aria-label={label}
                        className={`grid size-8 place-items-center rounded-sm transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-secondary hover:bg-surface-muted hover:text-text'}`}
                      />
                    }
                  >
                    <Icon size={16} aria-hidden="true" />
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              )
            })}
          </nav>
          <div className="h-px bg-border-soft" />
          <AppUserMenu compact />
        </div>
      </aside>
    </TooltipProvider>
  );
}
