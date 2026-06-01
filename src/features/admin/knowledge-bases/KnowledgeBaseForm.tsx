import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Toggle } from '@/components/ui/Toggle'
import {
  useCreateKnowledgeBase,
  useUpdateKnowledgeBase,
  useActivateKnowledgeBase,
  useDeactivateKnowledgeBase,
} from './hooks/useKnowledgeBases'
import type { ApiError } from '@/api/client'
import type { KnowledgeBaseDto } from '@/types/api'

const VECTOR_STORE_OPTIONS = [
  { value: 'PGVECTOR', label: 'PGVECTOR' },
  { value: 'WEAVIATE', label: 'WEAVIATE' },
  { value: 'QDRANT', label: 'QDRANT' },
  { value: 'PINECONE', label: 'PINECONE' },
]

const schema = z.object({
  knowledgeBaseId: z
    .string()
    .min(1, 'Required')
    .max(100, 'Max 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, digits, and hyphens only'),
  name: z.string().min(1, 'Required').max(255, 'Max 255 characters'),
  vectorStoreType: z.string().min(1, 'Required'),
  embeddingModel: z.string().min(1, 'Required').max(255, 'Max 255 characters'),
  connectionRef: z.string().min(1, 'Required').max(1024, 'Max 1024 characters'),
  metadataFilterPolicy: z
    .string()
    .refine(
      (s) => {
        if (!s.trim()) return true
        try { JSON.parse(s); return true } catch { return false }
      },
      'Must be valid JSON (e.g. {"product":"home-loan"})',
    )
    .optional(),
  active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface KnowledgeBaseFormProps {
  open: boolean
  onClose: () => void
  kb?: KnowledgeBaseDto
}

export function KnowledgeBaseForm({ open, onClose, kb }: KnowledgeBaseFormProps) {
  const isEdit = !!kb
  const create = useCreateKnowledgeBase()
  const update = useUpdateKnowledgeBase()
  const activate = useActivateKnowledgeBase()
  const deactivate = useDeactivateKnowledgeBase()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      knowledgeBaseId: '',
      name: '',
      vectorStoreType: 'PGVECTOR',
      embeddingModel: '',
      connectionRef: '',
      metadataFilterPolicy: '',
      active: true,
    },
  })

  useEffect(() => {
    if (open) {
      const metaJson = kb?.metadataFilterPolicy
        ? JSON.stringify(kb.metadataFilterPolicy, null, 2)
        : ''
      form.reset({
        knowledgeBaseId: kb?.knowledgeBaseId ?? '',
        name: kb?.name ?? '',
        vectorStoreType: kb?.vectorStoreType ?? 'PGVECTOR',
        embeddingModel: kb?.embeddingModel ?? '',
        connectionRef: kb?.connectionRef ?? '',
        metadataFilterPolicy: metaJson,
        active: kb?.active ?? true,
      })
    }
  }, [open, kb, form])

  function handleSubmit(values: FormValues) {
    const onError = (err: ApiError) => {
      err.fieldErrors?.forEach((fe) =>
        form.setError(fe.field as keyof FormValues, { message: fe.message }),
      )
    }

    const metadataFilterPolicy = values.metadataFilterPolicy?.trim()
      ? (JSON.parse(values.metadataFilterPolicy) as Record<string, string>)
      : null

    if (isEdit) {
      update.mutate(
        {
          kbId: kb.knowledgeBaseId,
          req: {
            name: values.name,
            vectorStoreType: values.vectorStoreType,
            embeddingModel: values.embeddingModel,
            connectionRef: values.connectionRef,
            metadataFilterPolicy,
          },
        },
        {
          onSuccess: () => {
            // Handle active toggle change
            if (values.active !== kb.active) {
              const toggleFn = values.active ? activate : deactivate
              toggleFn.mutate(kb.knowledgeBaseId, { onSettled: onClose })
            } else {
              onClose()
            }
          },
          onError,
        },
      )
    } else {
      create.mutate(
        {
          knowledgeBaseId: values.knowledgeBaseId,
          name: values.name,
          vectorStoreType: values.vectorStoreType,
          embeddingModel: values.embeddingModel,
          connectionRef: values.connectionRef,
          metadataFilterPolicy,
        },
        {
          onSuccess: (data) => {
            if (values.active) {
              activate.mutate(data.knowledgeBaseId, { onSettled: onClose })
            } else {
              onClose()
            }
          },
          onError,
        },
      )
    }
  }

  const isPending =
    create.isPending || update.isPending || activate.isPending || deactivate.isPending
  const metaValue = form.watch('metadataFilterPolicy') ?? ''

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit Knowledge Base — ${kb.knowledgeBaseId}` : 'Register Knowledge Base'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="kb-form" loading={isPending}>
            {isEdit ? 'Save Changes' : 'Register'}
          </Button>
        </>
      }
    >
      <form
        id="kb-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        {/* KB ID + Name */}
        {isEdit ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span
                className="text-[11px] font-bold uppercase tracking-[.4px]"
                style={{ color: 'var(--muted)' }}
              >
                Knowledge Base ID
              </span>
              <code
                style={{
                  display: 'block',
                  background: 'var(--surface3)',
                  border: '1px solid var(--border)',
                  borderRadius: '7px',
                  color: 'var(--muted)',
                  fontSize: '12px',
                  padding: '7px 10px',
                  fontFamily: 'monospace',
                }}
              >
                {kb.knowledgeBaseId}
              </code>
            </div>
            <Input
              label="Display Name"
              required
              error={form.formState.errors.name?.message}
              {...form.register('name')}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Knowledge Base ID"
              required
              placeholder="e.g. kb-home-loans"
              hint="Lowercase letters, digits, hyphens only"
              error={form.formState.errors.knowledgeBaseId?.message}
              {...form.register('knowledgeBaseId')}
            />
            <Input
              label="Display Name"
              required
              placeholder="e.g. Home Loan Policy KB"
              error={form.formState.errors.name?.message}
              {...form.register('name')}
            />
          </div>
        )}

        {/* Vector Store Type */}
        <Select
          label="Vector Store Type"
          required
          options={VECTOR_STORE_OPTIONS}
          error={form.formState.errors.vectorStoreType?.message}
          {...form.register('vectorStoreType')}
        />

        {/* Embedding Model */}
        <Input
          label="Embedding Model"
          required
          placeholder="e.g. text-embedding-3-small"
          error={form.formState.errors.embeddingModel?.message}
          {...form.register('embeddingModel')}
        />

        {/* Connection Ref */}
        <Input
          label="Connection Ref"
          required
          placeholder="e.g. pgvector://chatbot/kb_home_loans"
          hint="Connection string or datasource ref"
          error={form.formState.errors.connectionRef?.message}
          {...form.register('connectionRef')}
        />

        {/* Metadata Filter Policy — raw JSON textarea */}
        <Textarea
          label="Metadata Filter Policy (JSON)"
          placeholder='{"product":"home-loan"}'
          rows={2}
          value={metaValue}
          error={form.formState.errors.metadataFilterPolicy?.message}
          className="font-mono text-[11px]"
          {...form.register('metadataFilterPolicy')}
        />

        {/* Active toggle block */}
        <div
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>Active</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '1px' }}>
                Make this knowledge base available for RAG policies
              </div>
            </div>
            <Controller
              control={form.control}
              name="active"
              render={({ field }) => (
                <Toggle checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}
