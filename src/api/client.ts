import axios from 'axios'
import type { ApiErrorResponse, FieldValidationError } from '@/types/api'

export class ApiError extends Error {
  readonly errorCode: string
  readonly fieldErrors?: FieldValidationError[]

  constructor(errorCode: string, message: string, fieldErrors?: FieldValidationError[]) {
    super(message)
    this.name = 'ApiError'
    this.errorCode = errorCode
    this.fieldErrors = fieldErrors
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    const response = (err as { response?: { data?: ApiErrorResponse } }).response
    const data = response?.data
    return Promise.reject(
      new ApiError(
        data?.errorCode ?? 'UNKNOWN',
        data?.errorMessage ?? (err instanceof Error ? err.message : 'Unknown error'),
        data?.fieldErrors,
      ),
    )
  },
)
