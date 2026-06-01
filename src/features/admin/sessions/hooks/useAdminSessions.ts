import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminSessionsApi, type AdminSessionsQueryParams } from '@/api/admin/admin-sessions'
import type { ApiError } from '@/api/client'
import type { AdminSessionSummary } from '@/types/api'

const QUERY_KEY = ['admin-sessions']

export function useAdminSessions(params?: AdminSessionsQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => adminSessionsApi.list(params),
    staleTime: 30_000,
  })
}

export function useCloseSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => adminSessionsApi.close(sessionId),
    onMutate: async (sessionId) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const snapshots = qc.getQueriesData<AdminSessionSummary[]>({ queryKey: QUERY_KEY })
      qc.setQueriesData<AdminSessionSummary[]>({ queryKey: QUERY_KEY }, (old) =>
        old?.map((s) => (s.sessionId === sessionId ? { ...s, status: 'CLOSED' as const } : s)),
      )
      return { snapshots }
    },
    onError: (_err: ApiError, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data))
      toast.error('Failed to close session')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onSuccess: () => toast.success('Session closed'),
  })
}

export function useDeleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => adminSessionsApi.delete(sessionId),
    onMutate: async (sessionId) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const snapshots = qc.getQueriesData<AdminSessionSummary[]>({ queryKey: QUERY_KEY })
      qc.setQueriesData<AdminSessionSummary[]>({ queryKey: QUERY_KEY }, (old) =>
        old?.filter((s) => s.sessionId !== sessionId),
      )
      return { snapshots }
    },
    onError: (_err: ApiError, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data))
      toast.error('Failed to delete session')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onSuccess: () => toast.success('Session deleted'),
  })
}
