import axios from 'axios'

import type { ApiErrorResponse } from '../types/api'

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.message ?? error.message ?? fallback
  }

  if (error instanceof Error) return error.message

  return fallback
}

export function isUnauthorizedApiError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}
