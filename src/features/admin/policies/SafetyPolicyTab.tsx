import { useEffect, useState, type KeyboardEvent } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Spinner } from '@/components/ui/Spinner'
import { useSafetyPolicy, useUpsertSafetyPolicy } from './hooks/usePolicies'
import type { ApiError } from '@/api/client'

type RawFormValues = {
  blockUnknownTools: boolean
  blockWithoutRagWhenGroundedMode: boolean
  allowDirectModelAnswerWithoutContext: boolean
  maskSensitiveDataInLogs: boolean
}

interface SafetyPolicyTabProps {
  assistantCode: string
}

export function SafetyPolicyTab({ assistantCode }: SafetyPolicyTabProps) {
  const { data: policy, isLoading, error } = useSafetyPolicy(assistantCode)
  const upsert = useUpsertSafetyPolicy(assistantCode)
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')

  const form = useForm<RawFormValues>({
    defaultValues: {
      blockUnknownTools: false,
      blockWithoutRagWhenGroundedMode: false,
      allowDirectModelAnswerWithoutContext: false,
      maskSensitiveDataInLogs: false,
    },
  })

  useEffect(() => {
    if (policy) {
      form.reset({
        blockUnknownTools: policy.blockUnknownTools ?? false,
        blockWithoutRagWhenGroundedMode: policy.blockWithoutRagWhenGroundedMode ?? false,
        allowDirectModelAnswerWithoutContext: policy.allowDirectModelAnswerWithoutContext ?? false,
        maskSensitiveDataInLogs: policy.maskSensitiveDataInLogs ?? false,
      })
      setTopics(policy.disallowedTopics ?? [])
    }
  }, [policy, form])

  function addTopic() {
    const t = topicInput.trim()
    if (t && !topics.includes(t)) {
      setTopics((prev) => [...prev, t])
      setTopicInput('')
    }
  }

  function handleTopicKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTopic()
    }
  }

  function removeTopic(t: string) {
    setTopics((prev) => prev.filter((x) => x !== t))
  }

  function handleSubmit(raw: RawFormValues) {
    upsert.mutate(
      {
        blockUnknownTools: raw.blockUnknownTools,
        blockWithoutRagWhenGroundedMode: raw.blockWithoutRagWhenGroundedMode,
        allowDirectModelAnswerWithoutContext: raw.allowDirectModelAnswerWithoutContext,
        maskSensitiveDataInLogs: raw.maskSensitiveDataInLogs,
        disallowedTopics: topics.length > 0 ? topics : null,
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
          No safety policy configured yet. Fill in the form and save to create one.
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Left: Runtime Guards panel */}
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
            Runtime Guards
          </div>
          {(
            [
              { name: 'blockUnknownTools', label: 'Block Unknown Tools', desc: 'Reject requests referencing tool names not in the allow-list' },
              { name: 'blockWithoutRagWhenGroundedMode', label: 'Block Without RAG (Grounded Mode)', desc: 'Block model from answering if RAG retrieval fails when grounded mode is on' },
              { name: 'allowDirectModelAnswerWithoutContext', label: 'Allow Direct Model Answer Without Context', desc: 'Allow model to answer from training data when no retrieved context is found' },
              { name: 'maskSensitiveDataInLogs', label: 'Mask Sensitive Data in Logs', desc: 'Apply PII/credential masking before writing to application logs' },
            ] as const
          ).map((item, i) => (
            <div
              key={item.name}
              className="flex items-center justify-between"
              style={{
                padding: '8px 0',
                borderBottom: i < 3 ? '1px solid var(--border)' : undefined,
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

        {/* Right: Disallowed topics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
            Disallowed Topics
          </label>
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1" style={{ marginBottom: '4px' }}>
              {topics.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1"
                  style={{
                    background: 'var(--surface3)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    color: 'var(--text)',
                  }}
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTopic(t)}
                    aria-label={`Remove ${t}`}
                    style={{ color: 'var(--muted)', lineHeight: 1 }}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Type a topic and press Enter or comma"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={handleTopicKeyDown}
            />
            <Button type="button" variant="ghost" onClick={addTopic}>
              Add
            </Button>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
            One topic per entry. Requests matching these will be blocked.
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={upsert.isPending}>
          Save Safety Policy
        </Button>
      </div>
    </form>
  )
}
