import { apiClient } from '@/api/client'
import type {
  ModelRouteDto,
  CreateModelRouteRequest,
  UpdateModelRouteRequest,
} from '@/types/api'

export const routesApi = {
  list: (assistantCode: string, params?: { activeOnly?: boolean }) =>
    apiClient
      .get<ModelRouteDto[]>(`/api/v1/admin/assistants/${assistantCode}/routes`, { params })
      .then((r) => r.data),

  get: (assistantCode: string, id: number) =>
    apiClient
      .get<ModelRouteDto>(`/api/v1/admin/assistants/${assistantCode}/routes/${id}`)
      .then((r) => r.data),

  create: (assistantCode: string, req: CreateModelRouteRequest) =>
    apiClient
      .post<ModelRouteDto>(`/api/v1/admin/assistants/${assistantCode}/routes`, req)
      .then((r) => r.data),

  update: (assistantCode: string, id: number, req: UpdateModelRouteRequest) =>
    apiClient
      .put<ModelRouteDto>(`/api/v1/admin/assistants/${assistantCode}/routes/${id}`, req)
      .then((r) => r.data),

  delete: (assistantCode: string, id: number) =>
    apiClient
      .delete(`/api/v1/admin/assistants/${assistantCode}/routes/${id}`)
      .then((r) => r.data),
}
