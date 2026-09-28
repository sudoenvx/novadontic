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
      <div className="scrollbar-brand mx-auto flex h-screen max-w-6xl flex-col gap-3 overflow-x-hidden overflow-y-auto p-3 md:pl-14">
        <AppSidebar />
        <AppTopbar onOpenCommandMenu={() => setIsCommandOpen(true)} />
        <Outlet />
      </div>
      <AppCommandMenu open={isCommandOpen} onOpenChange={setIsCommandOpen} />
    </Toaster>
  )
}
