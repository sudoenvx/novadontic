import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'

import { socketClient } from '../../shared/realtime/socketClient'

export function RealtimeProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const socket = socketClient
    if (!socket) return

    socket.connect()
    return () => {
      socket.disconnect()
    }
  }, [])

  return children
}
