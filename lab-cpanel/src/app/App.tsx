import { RouterProvider } from 'react-router-dom'

import { QueryProvider } from './providers/QueryProvider'
import { RealtimeProvider } from './providers/RealtimeProvider'
import { AuthProvider } from '../features/auth'
import { ThemeProvider } from '../shared/providers/ThemeProvider'
import { router } from './router'

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RealtimeProvider>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </RealtimeProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
