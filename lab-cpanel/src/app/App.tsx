import { RouterProvider } from 'react-router-dom'

import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from '../features/auth'
import { ThemeProvider } from '../shared/providers/ThemeProvider'
import { router } from './router'

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
