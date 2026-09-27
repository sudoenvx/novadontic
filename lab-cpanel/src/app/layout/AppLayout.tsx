import { Outlet } from 'react-router-dom'

import { Toaster } from '../../shared/ui/Toast'
import { AppHeader } from './AppHeader'

export function AppLayout() {
  return (
    <Toaster>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-3 p-3">
        <AppHeader />
        <Outlet />
      </div>
    </Toaster>
  )
}
