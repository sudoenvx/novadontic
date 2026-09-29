import axios from 'axios'

import { API_KEY_HEADER, apiConfig } from './apiConfig'
import { getAccessToken } from './accessToken'

export const httpClient = axios.create({
  baseURL: apiConfig.baseURL,
  headers: apiConfig.apiKey
    ? { [API_KEY_HEADER]: apiConfig.apiKey }
    : undefined,
})

httpClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()
  if (accessToken) {
    config.headers.set('Authorization', accessToken)
  } else {
    config.headers.delete('Authorization')
  }

  return config
})
