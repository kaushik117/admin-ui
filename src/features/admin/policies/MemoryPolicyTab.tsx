import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Spinner } from '@/components/ui/Spinner'
import { useMemoryPolicy, useUpsertMemoryPolicy } from './hooks/usePolicies'
import type { ApiError } from '@/api/client'

const STORE_TYPE_OPTIONS = [
  { value: 'NONE', label: 'None' },
  { value: 'IN_MEMORY', label: 'In-Memory' },
  { value: 'JDBC', label: 'JDBC (Database)' },
]

const schema = z.object({
  memoryEnabled: z.boolean(),
  storeType: z.enum(['NONE', 'IN_MEMORY', 'JDBC']),
  messageWindowSize: z
    .string()
    .optional()
    .transform((v) => (v === '' || v == null ? null : parseInt(v, 10)))
    .pipe(z.number().int().min(1).max(1000).nullable()),
  ttlMinutes: z
    .string()
    .optional()
    .transform((v) => (v === '' || v == null ? null : parseInt(v, 10)))
    .pipe(z.number().int().min(1).max(43200).nullable()),
  persistChatHistory: z.boolean(),
  summarizeOldMessages: z.boolean(),
})

type FormValues = z.infer<typeof schema>
type RawFormValues = {
  memoryEnabled: boolean
  storeType: 'NONE' | 'IN_MEMORY' | 'JDBC'
  messageWindowSize: string
  ttlMinutes: string
  persistChatHistory: boolean
  summarizeOldMessages: boolean
}

interface MemoryPolicyTabProps {
  assistantCode: string
}

export function MemoryPolicyTab({ assistantCode }: MemoryPolicyTabProps) {
  const { data: policy, isLoading, error } = useMemoryPolicy(assistantCode)
  const upsert = useUpsertMemoryPolicy(assistantCode)

  const form = useForm<RawFormValues>({
    defaultValues: {
      memoryEnabled: false,
      storeType: 'NONE',
      messageWindowSize: '',
      ttlMinutes: '',
      persistChatHistory: false,
      summarizeOldMessages: false,
    },
  })

  useEffect(() => {
    if (policy) {
      form.reset({
        memoryEnabled: policy.memoryEnabled ?? false,
        storeType: (policy.storeType as 'NONE' | 'IN_MEMORY' | 'JDBC') ?? 'NONE',
        messageWindowSize: policy.messageWindowSize != null ? String(policy.messageWindowSize) : '',
        ttlMinutes: policy.ttlMinutes != null ? String(policy.ttlMinutes) : '',
        persistChatHistory: policy.persistChatHistory ?? false,
        summarizeOldMessages: policy.summarizeOldMessages ?? false,
      })
    }
  }, [policy, form])

  function handleSubmit(raw: RawFormValues) {
    const parsed = schema.parse(raw) as FormValues
    upsert.mutate(
      {
        memoryEnabled: parsed.memoryEnabled,
        storeType: parsed.storeType,
        messageWindowSize: parsed.messageWindowSize,
        ttlMinutes: parsed.ttlMinutes,
        persistChatHistory: parsed.persistChatHistory,
        summarizeOldMessages: parsed.summarizeOldMessages,
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
          No memory policy configured yet. Fill in the form and save to create one.
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Left: form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Store Type"
            required
            hint="JDBC = durable DB storage · IN_MEMORY = volatile · NONE = stateless"
            options={STORE_TYPE_OPTIONS}
            error={form.formState.errors.storeType?.message}
            {...form.register('storeType')}
          />
          <Input
            label="Message Window Size"
            type="number"
            placeholder="e.g. 20"
            hint="Max past messages loaded into model context"
            error={form.formState.errors.messageWindowSize?.message}
            {...form.register('messageWindowSize')}
          />
          <Input
            label="TTL (minutes)"
            type="number"
            placeholder="e.g. 1440"
            hint="1440 = 24 hours. Memory records expire after this duration."
            error={form.formState.errors.ttlMinutes?.message}
            {...form.register('ttlMinutes')}
          />
        </div>

        {/* Right: Flags panel */}
        <div
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '14px',
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
              { name: 'memoryEnabled', label: 'Memory Enabled', desc: 'Turn on/off the entire memory pipeline for this assistant' },
              { name: 'persistChatHistory', label: 'Persist Chat History', desc: 'Save all messages to the database for audit and recall' },
              { name: 'summarizeOldMessages', label: 'Summarize Old Messages', desc: 'Summarise messages beyond window size instead of discarding' },
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
          Save Memory Policy
        </Button>
      </div>
    </form>
  )
}
