import { io } from 'socket.io-client'

import { apiConfig, realtimeConfig } from '../api/apiConfig'

export const socketClient = realtimeConfig.url
  ? io(realtimeConfig.url, {
      autoConnect: false,
      auth: apiConfig.apiKey ? { apiKey: apiConfig.apiKey } : undefined,
    })
  : null
