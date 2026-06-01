import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { assistantsApi } from '@/api/admin/assistants'
import type { ApiError } from '@/api/client'
import type { AssistantSummary, CreateAssistantRequest, UpdateAssistantRequest } from '@/types/api'

const QUERY_KEY = ['assistants']

export function useAssistants(params?: { active?: boolean; tenantScope?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => assistantsApi.list(params),
    staleTime: 60_000,
  })
}

export function useCreateAssistant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateAssistantRequest) => assistantsApi.create(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Assistant created')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

export function useUpdateAssistant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ assistantCode, req }: { assistantCode: string; req: UpdateAssistantRequest }) =>
      assistantsApi.update(assistantCode, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Assistant updated')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

export function useActivateAssistant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (assistantCode: string) => assistantsApi.activate(assistantCode),
    onMutate: async (assistantCode) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const snapshots = qc.getQueriesData<AssistantSummary[]>({ queryKey: QUERY_KEY })
      qc.setQueriesData<AssistantSummary[]>({ queryKey: QUERY_KEY }, (old) =>
        old?.map((a) => (a.assistantCode === assistantCode ? { ...a, active: true } : a)),
      )
      return { snapshots }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data))
      toast.error('Failed to activate assistant')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onSuccess: () => toast.success('Assistant activated'),
  })
}

export function useDeactivateAssistant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (assistantCode: string) => assistantsApi.deactivate(assistantCode),
    onMutate: async (assistantCode) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const snapshots = qc.getQueriesData<AssistantSummary[]>({ queryKey: QUERY_KEY })
      qc.setQueriesData<AssistantSummary[]>({ queryKey: QUERY_KEY }, (old) =>
        old?.map((a) => (a.assistantCode === assistantCode ? { ...a, active: false } : a)),
      )
      return { snapshots }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data))
      toast.error('Failed to deactivate assistant')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onSuccess: () => toast.success('Assistant deactivated'),
  })
}
