import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

import { QUERY_STALE_TIME_MS } from '../config/constants'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MS,
      refetchOnWindowFocus: false
    },
  },
})

export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
