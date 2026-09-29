import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useEffect } from 'react'

import { socketClient } from './socketClient'

export function useRealtimeQueryInvalidation(
  eventName: string,
  queryKey: QueryKey,
): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = socketClient
    if (!socket) return

    const invalidateQuery = () => {
      void queryClient.invalidateQueries({ queryKey })
    }

    socket.on(eventName, invalidateQuery)
    return () => {
      socket.off(eventName, invalidateQuery)
    }
  }, [eventName, queryClient, queryKey])
}
