export type ApiResponse<TData> = {
  data: TData
}

export type ApiErrorResponse = {
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}

export type CursorPaginationParams = {
  limit?: number
  cursor?: string
}

export type CursorPaginatedData<TItem> = {
  data: TItem[]
  nextCursor: string | null
  total: number
}
