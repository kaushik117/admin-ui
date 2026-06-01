import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { routesApi } from '@/api/admin/routes'
import type { ApiError } from '@/api/client'
import type { CreateModelRouteRequest, UpdateModelRouteRequest } from '@/types/api'

function queryKey(assistantCode: string) {
  return ['assistants', assistantCode, 'routes'] as const
}

export function useModelRoutes(assistantCode: string) {
  return useQuery({
    queryKey: queryKey(assistantCode),
    queryFn: () => routesApi.list(assistantCode),
    enabled: !!assistantCode,
    staleTime: 60_000,
    select: (data) => [...data].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)),
  })
}

export function useCreateModelRoute(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateModelRouteRequest) => routesApi.create(assistantCode, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(assistantCode) })
      toast.success('Route created')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

export function useUpdateModelRoute(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdateModelRouteRequest }) =>
      routesApi.update(assistantCode, id, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(assistantCode) })
      toast.success('Route updated')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

export function useDeleteModelRoute(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => routesApi.delete(assistantCode, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(assistantCode) })
      toast.success('Route deleted')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}
