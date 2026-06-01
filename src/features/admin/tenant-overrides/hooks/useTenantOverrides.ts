import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tenantOverridesApi } from '@/api/admin/tenant-overrides'
import type { ApiError } from '@/api/client'
import type { CreateTenantOverrideRequest, UpdateTenantOverrideRequest } from '@/types/api'

const QUERY_KEY = ['tenant-overrides']

export function useTenantOverrides(params?: { tenantId?: string; assistantCode?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => tenantOverridesApi.list(params),
    staleTime: 30_000,
  })
}

export function useCreateTenantOverride() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateTenantOverrideRequest) => tenantOverridesApi.create(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Tenant override created')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

export function useUpdateTenantOverride() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdateTenantOverrideRequest }) =>
      tenantOverridesApi.update(id, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Tenant override updated')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

export function useDeleteTenantOverride() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tenantOverridesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Tenant override deleted')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}
