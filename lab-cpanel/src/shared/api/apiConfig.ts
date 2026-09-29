const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const apiKey = import.meta.env.VITE_API_KEY?.trim()
const realtimeUrl = import.meta.env.VITE_REALTIME_URL?.trim()

export const API_KEY_HEADER = 'X-API-Key'

export const apiConfig = {
  baseURL: apiBaseUrl || undefined,
  apiKey: apiKey || undefined,
} as const

export const realtimeConfig = {
  url: realtimeUrl || apiBaseUrl || undefined,
} as const
