import { apiClient } from '@/api/client'
import type {
  TenantOverrideDto,
  CreateTenantOverrideRequest,
  UpdateTenantOverrideRequest,
} from '@/types/api'

export const tenantOverridesApi = {
  list: (params?: { tenantId?: string; assistantCode?: string; page?: number; size?: number }) =>
    apiClient
      .get<TenantOverrideDto[]>('/api/v1/admin/tenant-overrides', { params })
      .then((r) => r.data),

  get: (id: number) =>
    apiClient
      .get<TenantOverrideDto>(`/api/v1/admin/tenant-overrides/${id}`)
      .then((r) => r.data),

  create: (req: CreateTenantOverrideRequest) =>
    apiClient
      .post<TenantOverrideDto>('/api/v1/admin/tenant-overrides', req)
      .then((r) => r.data),

  update: (id: number, req: UpdateTenantOverrideRequest) =>
    apiClient
      .put<TenantOverrideDto>(`/api/v1/admin/tenant-overrides/${id}`, req)
      .then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/api/v1/admin/tenant-overrides/${id}`),
}
