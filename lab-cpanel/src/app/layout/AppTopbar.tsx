import { formatForDisplay } from '@tanstack/react-hotkeys'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Brand } from '../../shared/ui/Brand'
import { Button } from '../../shared/ui/Button'
import { Kbd } from '../../shared/ui/Kbd'
import { AppUserMenu } from './AppUserMenu'

type AppTopbarProps = {
  context?: string
  onOpenCommandMenu: () => void
}

export function AppTopbar({ context, onOpenCommandMenu }: AppTopbarProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 rounded-md bg-surface p-2 shadow-card max-sm:flex-col max-sm:items-start max-sm:p-3">
      <Brand context={context} onClick={() => navigate('/')} />
      <div className="flex items-center gap-2 max-sm:w-full">
        <Button
          variant="transparent"
          size="sm"
          className="min-w-52 justify-between bg-neutral-100 text-secondary max-sm:min-w-0 max-sm:flex-1"
          onClick={onOpenCommandMenu}
          aria-label="Open command menu"
        >
          <span className="flex items-center gap-2 text-sm text-text-muted">
            <Search size={16} /> Search
          </span>
          <Kbd>{formatForDisplay('Mod+K')}</Kbd>
        </Button>
        <AppUserMenu />
      </div>
    </header>
  )
}
