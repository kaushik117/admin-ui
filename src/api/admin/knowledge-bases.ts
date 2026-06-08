import { apiClient } from '@/api/client'
import type {
  KnowledgeBaseDto,
  KnowledgeBaseSummary,
  CreateKnowledgeBaseRequest,
  UpdateKnowledgeBaseRequest,
  KbDocumentSummaryDto,
  KbDocumentUploadResponseDto,
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

  listDocuments: (kbId: string) =>
    apiClient
      .get<KbDocumentSummaryDto[]>(`/api/v1/admin/knowledge-bases/${kbId}/documents`)
      .then((r) => r.data),

  uploadDocument: (kbId: string, formData: FormData) =>
    apiClient
      .post<KbDocumentUploadResponseDto>(`/api/v1/admin/knowledge-bases/${kbId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  deleteDocument: (kbId: string, sourceTitle: string) =>
    apiClient
      .delete<void>(`/api/v1/admin/knowledge-bases/${kbId}/documents/${encodeURIComponent(sourceTitle)}`)
      .then((r) => r.data),
}
