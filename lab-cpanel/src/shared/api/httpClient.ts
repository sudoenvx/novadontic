import axios from 'axios'

import { API_KEY_HEADER, apiConfig } from './apiConfig'

export const httpClient = axios.create({
  baseURL: apiConfig.baseURL,
  headers: apiConfig.apiKey
    ? { [API_KEY_HEADER]: apiConfig.apiKey }
    : undefined,
})
