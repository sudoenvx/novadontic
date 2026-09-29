import { formatForDisplay } from '@tanstack/react-hotkeys'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Brand } from '../../shared/ui/Brand'
import { Button } from '../../shared/ui/Button'
import { Kbd } from '../../shared/ui/Kbd'
import { ThemeSwitcher } from '../../shared/ui/ThemeSwitcher'
import { AppUserMenu } from './AppUserMenu'

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
          className="min-w-52 px-1.5 py-1.5 justify-between bg-surface hover:bg-surface text-secondary max-sm:min-w-0 max-sm:flex-1"
          onClick={onOpenCommandMenu}
          aria-label="Open command menu"
        >
          <span className="flex items-center gap-2 text-sm text-text-muted">
            <Search size={16} />
            <span className="">Search</span>
          </span>
          <Kbd>{formatForDisplay('Mod+K')}</Kbd>
        </Button>
        <ThemeSwitcher size="compact" />
        <AppUserMenu />
      </div>
    </header>
  )
}
