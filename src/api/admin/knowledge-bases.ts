import { apiClient } from '@/api/client'
import type {
  KnowledgeBaseDto,
  KnowledgeBaseSummary,
  CreateKnowledgeBaseRequest,
  UpdateKnowledgeBaseRequest,
} from '@/types/api'

export const knowledgeBasesApi = {
  list: (params?: { active?: boolean }) =>
    apiClient
      .get<KnowledgeBaseSummary[]>('/api/v1/admin/knowledge-bases', { params })
      .then((r) => r.data),

  get: (kbId: string) =>
    apiClient
      .get<KnowledgeBaseDto>(`/api/v1/admin/knowledge-bases/${kbId}`)
      .then((r) => r.data),

  create: (req: CreateKnowledgeBaseRequest) =>
    apiClient
      .post<KnowledgeBaseDto>('/api/v1/admin/knowledge-bases', req)
      .then((r) => r.data),

  update: (kbId: string, req: UpdateKnowledgeBaseRequest) =>
    apiClient
      .put<KnowledgeBaseDto>(`/api/v1/admin/knowledge-bases/${kbId}`, req)
      .then((r) => r.data),

  activate: (kbId: string) =>
    apiClient
      .post<KnowledgeBaseDto>(`/api/v1/admin/knowledge-bases/${kbId}/activate`)
      .then((r) => r.data),

  deactivate: (kbId: string) =>
    apiClient
      .post<KnowledgeBaseDto>(`/api/v1/admin/knowledge-bases/${kbId}/deactivate`)
      .then((r) => r.data),
}
