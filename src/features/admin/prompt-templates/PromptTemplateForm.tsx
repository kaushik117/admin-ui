import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useCreatePromptTemplate, useUpdatePromptTemplate } from './hooks/usePromptTemplates'
import type { ApiError } from '@/api/client'
import type { PromptTemplateDto } from '@/types/api'

const schema = z.object({
  version: z
    .string()
    .min(1, 'Required')
    .regex(/^v\d+\.\d+\.\d+$/, 'Must be semver e.g. v2.1.0'),
  systemPromptTemplate: z.string().min(1, 'Required').max(50000, 'Max 50,000 characters'),
  developerPromptTemplate: z.string().max(50000, 'Max 50,000 characters').optional(),
  promptVariables: z
    .array(z.object({ key: z.string().min(1, 'Key required'), value: z.string() }))
    .optional(),
  guardrailInstructions: z
    .array(z.object({ value: z.string().min(1, 'Instruction required') }))
    .optional(),
})

type FormValues = z.infer<typeof schema>

interface PromptTemplateFormProps {
  open: boolean
  onClose: () => void
  assistantCode: string
  template?: PromptTemplateDto
}

export function PromptTemplateForm({
  open,
  onClose,
  assistantCode,
  template,
}: PromptTemplateFormProps) {
  const isEdit = !!template
  const create = useCreatePromptTemplate(assistantCode)
  const update = useUpdatePromptTemplate(assistantCode)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      version: '',
      systemPromptTemplate: '',
      developerPromptTemplate: '',
      promptVariables: [],
      guardrailInstructions: [],
    },
  })

  const {
    fields: varFields,
    append: appendVar,
    remove: removeVar,
  } = useFieldArray({ control: form.control, name: 'promptVariables' })

  const {
    fields: guardrailFields,
    append: appendGuardrail,
    remove: removeGuardrail,
  } = useFieldArray({ control: form.control, name: 'guardrailInstructions' })

  useEffect(() => {
    if (open) {
      const variables = template?.promptVariables
        ? Object.entries(template.promptVariables).map(([key, value]) => ({ key, value }))
        : []
      const guardrails = template?.guardrailInstructions
        ? template.guardrailInstructions.map((v) => ({ value: v }))
        : []

      form.reset({
        version: template?.version ?? '',
        systemPromptTemplate: template?.systemPromptTemplate ?? '',
        developerPromptTemplate: template?.developerPromptTemplate ?? '',
        promptVariables: variables,
        guardrailInstructions: guardrails,
      })
    }
  }, [open, template, form])

  function handleSubmit(values: FormValues) {
    const onError = (err: ApiError) => {
      err.fieldErrors?.forEach((fe) =>
        form.setError(fe.field as keyof FormValues, { message: fe.message }),
      )
    }

    const promptVariables =
      values.promptVariables && values.promptVariables.length > 0
        ? Object.fromEntries(values.promptVariables.map(({ key, value }) => [key, value]))
        : null

    const guardrailInstructions =
      values.guardrailInstructions && values.guardrailInstructions.length > 0
        ? values.guardrailInstructions.map(({ value }) => value)
        : null

    if (isEdit && template?.id !== undefined) {
      update.mutate(
        {
          id: template.id,
          req: {
            version: values.version,
            systemPromptTemplate: values.systemPromptTemplate,
            developerPromptTemplate: values.developerPromptTemplate || null,
            promptVariables,
            guardrailInstructions,
          },
        },
        { onSuccess: onClose, onError },
      )
    } else {
      create.mutate(
        {
          version: values.version,
          systemPromptTemplate: values.systemPromptTemplate,
          developerPromptTemplate: values.developerPromptTemplate || null,
          promptVariables,
          guardrailInstructions,
        },
        { onSuccess: onClose, onError },
      )
    }
  }

  const isPending = create.isPending || update.isPending
  const sysPromptValue = form.watch('systemPromptTemplate') ?? ''
  const devPromptValue = form.watch('developerPromptTemplate') ?? ''

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit Template — ${template?.version}` : 'New Template Version'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="prompt-template-form" loading={isPending}>
            {isEdit ? 'Save Changes' : 'Create Template'}
          </Button>
        </>
      }
    >
      <form
        id="prompt-template-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {/* Version */}
        <Input
          label="Version"
          required
          placeholder="e.g. v2.1.0"
          hint="Semver string — must match v<major>.<minor>.<patch>"
          error={form.formState.errors.version?.message}
          {...form.register('version')}
        />

        {/* System Prompt */}
        <Textarea
          label="System Prompt Template"
          required
          placeholder="You are a helpful assistant…"
          rows={8}
          maxLength={50000}
          showCount
          value={sysPromptValue}
          error={form.formState.errors.systemPromptTemplate?.message}
          className="font-mono text-[11px]"
          {...form.register('systemPromptTemplate')}
        />

        {/* Developer Prompt */}
        <Textarea
          label="Developer Prompt Template"
          placeholder="Optional developer-facing instructions…"
          rows={4}
          maxLength={50000}
          showCount
          value={devPromptValue}
          error={form.formState.errors.developerPromptTemplate?.message}
          className="font-mono text-[11px]"
          {...form.register('developerPromptTemplate')}
        />

        {/* Prompt Variables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-bold uppercase tracking-[.4px]"
              style={{ color: 'var(--muted)' }}
            >
              Prompt Variables
            </span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              icon={<Plus size={11} />}
              onClick={() => appendVar({ key: '', value: '' })}
            >
              Add Variable
            </Button>
          </div>
          {varFields.length === 0 ? (
            <p style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}>
              No variables — click "Add Variable" to add key-value pairs.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {varFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div style={{ flex: 1 }}>
                    <input
                      placeholder="Key"
                      aria-label={`Variable key ${index + 1}`}
                      className="w-full rounded-[7px] border outline-none transition-colors focus:border-[var(--accent)]"
                      style={{
                        background: 'var(--surface2)',
                        borderColor: form.formState.errors.promptVariables?.[index]?.key
                          ? 'var(--red)'
                          : 'var(--border)',
                        color: 'var(--text)',
                        fontSize: '12px',
                        padding: '6px 10px',
                      }}
                      {...form.register(`promptVariables.${index}.key`)}
                    />
                    {form.formState.errors.promptVariables?.[index]?.key && (
                      <p style={{ fontSize: '10px', color: 'var(--red)', marginTop: '2px' }}>
                        {form.formState.errors.promptVariables[index]?.key?.message}
                      </p>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      placeholder="Value"
                      aria-label={`Variable value ${index + 1}`}
                      className="w-full rounded-[7px] border outline-none transition-colors focus:border-[var(--accent)]"
                      style={{
                        background: 'var(--surface2)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                        fontSize: '12px',
                        padding: '6px 10px',
                      }}
                      {...form.register(`promptVariables.${index}.value`)}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove variable ${index + 1}`}
                    onClick={() => removeVar(index)}
                    style={{
                      marginTop: '1px',
                      padding: '6px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--red)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guardrail Instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-bold uppercase tracking-[.4px]"
              style={{ color: 'var(--muted)' }}
            >
              Guardrail Instructions
            </span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              icon={<Plus size={11} />}
              onClick={() => appendGuardrail({ value: '' })}
            >
              Add Instruction
            </Button>
          </div>
          {guardrailFields.length === 0 ? (
            <p style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}>
              No guardrails — click "Add Instruction" to add safety directives.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {guardrailFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div style={{ flex: 1 }}>
                    <input
                      placeholder={`Guardrail instruction ${index + 1}…`}
                      aria-label={`Guardrail instruction ${index + 1}`}
                      className="w-full rounded-[7px] border outline-none transition-colors focus:border-[var(--accent)]"
                      style={{
                        background: 'var(--surface2)',
                        borderColor: form.formState.errors.guardrailInstructions?.[index]?.value
                          ? 'var(--red)'
                          : 'var(--border)',
                        color: 'var(--text)',
                        fontSize: '12px',
                        padding: '6px 10px',
                      }}
                      {...form.register(`guardrailInstructions.${index}.value`)}
                    />
                    {form.formState.errors.guardrailInstructions?.[index]?.value && (
                      <p style={{ fontSize: '10px', color: 'var(--red)', marginTop: '2px' }}>
                        {form.formState.errors.guardrailInstructions[index]?.value?.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove guardrail ${index + 1}`}
                    onClick={() => removeGuardrail(index)}
                    style={{
                      marginTop: '1px',
                      padding: '6px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--red)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}
