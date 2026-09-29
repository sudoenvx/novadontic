import { Outlet } from 'react-router-dom'
import { useState } from 'react'

import { Toaster } from '../../shared/ui/Toast'
import { AppCommandMenu } from './AppCommandMenu'
import { AppSidebar } from './AppSidebar'
import { AppTopbar } from './AppTopbar'

export function AppLayout() {
  const [isCommandOpen, setIsCommandOpen] = useState(false)

  return (
    <Toaster>
      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl gap-3 overflow-x-clip">
        <div className="sticky top-0 hidden h-dvh w-14 shrink-0 p-3 lg:block">
          <div className="relative h-full w-full">
            <AppSidebar />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <AppTopbar onOpenCommandMenu={() => setIsCommandOpen(true)} />
          <div className="grid min-w-0 gap-3 p-3">
            <Outlet />
          </div>
        </div>
      </div>
      <AppCommandMenu open={isCommandOpen} onOpenChange={setIsCommandOpen} />
    </Toaster>
  )
}
