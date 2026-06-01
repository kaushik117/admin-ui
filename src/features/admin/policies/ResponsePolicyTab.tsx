import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Spinner } from '@/components/ui/Spinner'
import { useResponsePolicy, useUpsertResponsePolicy } from './hooks/usePolicies'
import type { ApiError } from '@/api/client'

type RawFormValues = {
  markdownEnabled: boolean
  streamEnabled: boolean
  citationRequired: boolean
  defaultTone: string
  defaultFormat: string
  maxOutputTokens: string
}

interface ResponsePolicyTabProps {
  assistantCode: string
}

export function ResponsePolicyTab({ assistantCode }: ResponsePolicyTabProps) {
  const { data: policy, isLoading, error } = useResponsePolicy(assistantCode)
  const upsert = useUpsertResponsePolicy(assistantCode)

  const form = useForm<RawFormValues>({
    defaultValues: {
      markdownEnabled: false,
      streamEnabled: false,
      citationRequired: false,
      defaultTone: '',
      defaultFormat: '',
      maxOutputTokens: '',
    },
  })

  useEffect(() => {
    if (policy) {
      form.reset({
        markdownEnabled: policy.markdownEnabled ?? false,
        streamEnabled: policy.streamEnabled ?? false,
        citationRequired: policy.citationRequired ?? false,
        defaultTone: policy.defaultTone ?? '',
        defaultFormat: policy.defaultFormat ?? '',
        maxOutputTokens: policy.maxOutputTokens != null ? String(policy.maxOutputTokens) : '',
      })
    }
  }, [policy, form])

  function handleSubmit(raw: RawFormValues) {
    let maxOutputTokens: number | null = null
    if (raw.maxOutputTokens !== '') {
      const n = parseInt(raw.maxOutputTokens, 10)
      if (isNaN(n) || n < 64 || n > 32768) {
        form.setError('maxOutputTokens', { message: 'Must be 64–32768' })
        return
      }
      maxOutputTokens = n
    }

    upsert.mutate(
      {
        markdownEnabled: raw.markdownEnabled,
        streamEnabled: raw.streamEnabled,
        citationRequired: raw.citationRequired,
        defaultTone: raw.defaultTone || null,
        defaultFormat: raw.defaultFormat || null,
        maxOutputTokens,
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
          No response policy configured yet. Fill in the form and save to create one.
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Left: form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Default Tone"
            placeholder="e.g. professional, friendly, formal, concise"
            hint="Tone applied when not specified at runtime"
            error={form.formState.errors.defaultTone?.message}
            {...form.register('defaultTone')}
          />
          <Input
            label="Default Format"
            placeholder="e.g. markdown, text, json"
            hint="Format applied when not specified at runtime"
            error={form.formState.errors.defaultFormat?.message}
            {...form.register('defaultFormat')}
          />
          <Input
            label="Max Output Tokens"
            type="number"
            placeholder="e.g. 2048"
            hint="Hard cap on tokens the model may generate per response"
            error={form.formState.errors.maxOutputTokens?.message}
            {...form.register('maxOutputTokens')}
          />
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
              { name: 'markdownEnabled', label: 'Markdown Enabled', desc: 'Allow the model to use markdown formatting in responses' },
              { name: 'citationRequired', label: 'Citation Required', desc: 'Every response must include at least one source citation' },
              { name: 'streamEnabled', label: 'Streaming Enabled (Default)', desc: 'Use the streaming endpoint by default for this assistant' },
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
          Save Response Policy
        </Button>
      </div>
    </form>
  )
}
