import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { knowledgeBasesApi } from '@/api/admin/knowledge-bases'
import type { ApiError } from '@/api/client'
import type { KnowledgeBaseSummary, CreateKnowledgeBaseRequest, UpdateKnowledgeBaseRequest } from '@/types/api'

const QUERY_KEY = ['knowledge-bases']

export function useKnowledgeBases(params?: { active?: boolean }) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => knowledgeBasesApi.list(params),
    staleTime: 60_000,
  })
}

export function useCreateKnowledgeBase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateKnowledgeBaseRequest) => knowledgeBasesApi.create(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Knowledge base registered')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

export function useUpdateKnowledgeBase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ kbId, req }: { kbId: string; req: UpdateKnowledgeBaseRequest }) =>
      knowledgeBasesApi.update(kbId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Knowledge base updated')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

export function useActivateKnowledgeBase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (kbId: string) => knowledgeBasesApi.activate(kbId),
    onMutate: async (kbId) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const snapshots = qc.getQueriesData<KnowledgeBaseSummary[]>({ queryKey: QUERY_KEY })
      qc.setQueriesData<KnowledgeBaseSummary[]>({ queryKey: QUERY_KEY }, (old) =>
        old?.map((kb) => (kb.knowledgeBaseId === kbId ? { ...kb, active: true } : kb)),
      )
      return { snapshots }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data))
      toast.error('Failed to activate knowledge base')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onSuccess: () => toast.success('Knowledge base activated'),
  })
}

export function useDeactivateKnowledgeBase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (kbId: string) => knowledgeBasesApi.deactivate(kbId),
    onMutate: async (kbId) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const snapshots = qc.getQueriesData<KnowledgeBaseSummary[]>({ queryKey: QUERY_KEY })
      qc.setQueriesData<KnowledgeBaseSummary[]>({ queryKey: QUERY_KEY }, (old) =>
        old?.map((kb) => (kb.knowledgeBaseId === kbId ? { ...kb, active: false } : kb)),
      )
      return { snapshots }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data))
      toast.error('Failed to deactivate knowledge base')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onSuccess: () => toast.success('Knowledge base deactivated'),
  })
}
