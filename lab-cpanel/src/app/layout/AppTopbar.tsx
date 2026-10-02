import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Brand } from '../../shared/ui/Brand'
import { Button } from '../../shared/ui/Button'
import { ThemeSwitcher } from '../../shared/ui/ThemeSwitcher'
import { AppUserMenu } from './AppUserMenu'
import { formatForDisplay } from '@tanstack/react-hotkeys'
import { Badge } from '../../shared/ui/Badge'

type AppTopbarProps = {
  context?: string
  onOpenCommandMenu: () => void
}

export function AppTopbar({ context, onOpenCommandMenu }: AppTopbarProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex h-navbar w-full shrink-0 items-center justify-between gap-3 bg-canvas px-3">
      <Brand context={context} onClick={() => navigate('/')} />
      <div className="ml-auto flex min-w-0 items-center gap-3">
        <Button
          variant="outline"
          size="md"
          className="min-w-48 px-1.5 py-1 rounded-md border border-border-subtle gap-2 bg-surface hover:bg-surface text-secondary max-sm:min-w-0 max-sm:flex-1 flex items-center justify-between"
          onClick={onOpenCommandMenu}
          aria-label="Open command menu"
        >
          <span className="flex items-center gap-2 text-sm text-text-muted">
            <Search size={14} />
            <span className="">Search</span>
          </span>

          <Badge className="">
              {
                formatForDisplay("Mod+K")
              }
            </Badge>
        </Button>
        <ThemeSwitcher size="compact" />
        <AppUserMenu />
      </div>
    </header>
  )
}
