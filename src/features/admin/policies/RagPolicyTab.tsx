import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Spinner } from '@/components/ui/Spinner'
import { useRagPolicy, useUpsertRagPolicy } from './hooks/usePolicies'
import type { ApiError } from '@/api/client'

type RawFormValues = {
  ragEnabled: boolean
  citationsEnabled: boolean
  groundedAnswerRequired: boolean
  defaultKnowledgeBaseId: string
  retrievalStrategy: string
  topK: string
  similarityThreshold: string
  metadataFilters: string
}

interface RagPolicyTabProps {
  assistantCode: string
}

export function RagPolicyTab({ assistantCode }: RagPolicyTabProps) {
  const { data: policy, isLoading, error } = useRagPolicy(assistantCode)
  const upsert = useUpsertRagPolicy(assistantCode)

  const form = useForm<RawFormValues>({
    defaultValues: {
      ragEnabled: false,
      citationsEnabled: false,
      groundedAnswerRequired: false,
      defaultKnowledgeBaseId: '',
      retrievalStrategy: '',
      topK: '',
      similarityThreshold: '',
      metadataFilters: '',
    },
  })

  useEffect(() => {
    if (policy) {
      form.reset({
        ragEnabled: policy.ragEnabled ?? false,
        citationsEnabled: policy.citationsEnabled ?? false,
        groundedAnswerRequired: policy.groundedAnswerRequired ?? false,
        defaultKnowledgeBaseId: policy.defaultKnowledgeBaseId ?? '',
        retrievalStrategy: policy.retrievalStrategy ?? '',
        topK: policy.topK != null ? String(policy.topK) : '',
        similarityThreshold: policy.similarityThreshold != null ? String(policy.similarityThreshold) : '',
        metadataFilters: policy.metadataFilters
          ? JSON.stringify(policy.metadataFilters, null, 2)
          : '',
      })
    }
  }, [policy, form])

  function handleSubmit(raw: RawFormValues) {
    const topK = raw.topK !== '' ? parseInt(raw.topK, 10) : null
    const sim = raw.similarityThreshold !== '' ? parseFloat(raw.similarityThreshold) : null

    if (topK != null && (isNaN(topK) || topK < 1 || topK > 100)) {
      form.setError('topK', { message: 'Must be 1–100' })
      return
    }
    if (sim != null && (isNaN(sim) || sim < 0 || sim > 1)) {
      form.setError('similarityThreshold', { message: 'Must be 0.0–1.0' })
      return
    }

    let metadataFilters: Record<string, string> | null = null
    if (raw.metadataFilters.trim()) {
      try {
        metadataFilters = JSON.parse(raw.metadataFilters) as Record<string, string>
      } catch {
        form.setError('metadataFilters', { message: 'Must be valid JSON' })
        return
      }
    }

    upsert.mutate(
      {
        ragEnabled: raw.ragEnabled,
        citationsEnabled: raw.citationsEnabled,
        groundedAnswerRequired: raw.groundedAnswerRequired,
        defaultKnowledgeBaseId: raw.defaultKnowledgeBaseId || null,
        retrievalStrategy: raw.retrievalStrategy || null,
        topK,
        similarityThreshold: sim,
        metadataFilters,
      },
      {
        onError: (err: ApiError) => {
          err.fieldErrors?.forEach((fe) =>
            form.setError(fe.field as keyof RawFormValues, { message: fe.message }),
          )
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ padding: '40px' }}>
        <Spinner size="md" />
      </div>
    )
  }

  const apiErr = error as ApiError | null
  const isNotFound = apiErr?.errorCode === 'CONFIG_NOT_FOUND' || apiErr?.errorCode === 'ASSISTANT_NOT_FOUND'

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {isNotFound && (
        <div
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '12px',
            color: 'var(--muted)',
          }}
        >
          No RAG policy configured yet. Fill in the form and save to create one.
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Left: form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Default Knowledge Base ID"
            placeholder="e.g. kb-home-loans"
            error={form.formState.errors.defaultKnowledgeBaseId?.message}
            {...form.register('defaultKnowledgeBaseId')}
          />
          <Input
            label="Retrieval Strategy"
            placeholder="e.g. SEMANTIC, HYBRID, BM25"
            error={form.formState.errors.retrievalStrategy?.message}
            {...form.register('retrievalStrategy')}
          />
          <Input
            label="Top-K (chunks retrieved)"
            type="number"
            placeholder="e.g. 5"
            hint="Number of documents to retrieve (1–100)"
            error={form.formState.errors.topK?.message}
            {...form.register('topK')}
          />
          <Input
            label="Similarity Threshold (0–1)"
            type="number"
            placeholder="e.g. 0.75"
            hint="Minimum similarity score (0.0–1.0)"
            error={form.formState.errors.similarityThreshold?.message}
            {...form.register('similarityThreshold')}
          />

          {/* Metadata filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '.4px',
                marginBottom: '4px',
              }}
            >
              Metadata Filters (JSON)
            </label>
            <textarea
              rows={3}
              placeholder='{"product":"home-loan"}'
              className="font-mono rounded-[7px] border outline-none focus:border-[var(--accent)] transition-colors"
              style={{
                background: 'var(--surface2)',
                borderColor: form.formState.errors.metadataFilters ? 'var(--red)' : 'var(--border)',
                color: 'var(--text)',
                fontSize: '11px',
                padding: '7px 10px',
                resize: 'vertical',
              }}
              {...form.register('metadataFilters')}
            />
            {form.formState.errors.metadataFilters ? (
              <span style={{ fontSize: '11px', color: 'var(--red)' }}>
                {form.formState.errors.metadataFilters.message}
              </span>
            ) : (
              <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                Applied to every retrieval call for this assistant
              </span>
            )}
          </div>
        </div>

        {/* Right: Flags panel */}
        <div
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '14px',
            alignSelf: 'start',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '.4px',
              marginBottom: '10px',
            }}
          >
            Flags
          </div>
          {(
            [
              { name: 'ragEnabled', label: 'RAG Enabled', desc: 'Enable retrieval-augmented generation for this assistant' },
              { name: 'citationsEnabled', label: 'Citations Enabled', desc: 'Include source citations in assistant responses' },
              { name: 'groundedAnswerRequired', label: 'Grounded Answer Required', desc: 'Block responses that cannot cite a source document' },
            ] as const
          ).map((item, i) => (
            <div
              key={item.name}
              className="flex items-center justify-between"
              style={{
                padding: '8px 0',
                borderBottom: i < 2 ? '1px solid var(--border)' : undefined,
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '1px' }}>{item.desc}</div>
              </div>
              <Controller
                control={form.control}
                name={item.name}
                render={({ field }) => (
                  <Toggle checked={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={upsert.isPending}>
          Save RAG Policy
        </Button>
      </div>
    </form>
  )
}
