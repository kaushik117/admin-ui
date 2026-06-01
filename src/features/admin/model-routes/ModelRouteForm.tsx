import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { useCreateModelRoute, useUpdateModelRoute } from './hooks/useModelRoutes'
import type { ApiError } from '@/api/client'
import type { ModelRouteDto, RouteType, FallbackPolicy } from '@/types/api'

const ROUTE_TYPES: { value: RouteType; label: string }[] = [
  { value: 'SIMPLE', label: 'Simple' },
  { value: 'KNOWLEDGE_QA', label: 'Knowledge QA' },
  { value: 'TOOL_HEAVY', label: 'Tool Heavy' },
  { value: 'LONG_CONTEXT', label: 'Long Context' },
  { value: 'STRUCTURED_OUTPUT', label: 'Structured Output' },
]

const FALLBACK_POLICIES: { value: FallbackPolicy; label: string }[] = [
  { value: 'USE_DEFAULT_MODEL', label: 'Use Default Model' },
  { value: 'FAIL_FAST', label: 'Fail Fast' },
]

const schema = z.object({
  routeName: z.string().min(1, 'Required').max(255),
  routeType: z.enum(['SIMPLE', 'KNOWLEDGE_QA', 'TOOL_HEAVY', 'LONG_CONTEXT', 'STRUCTURED_OUTPUT']),
  priority: z
    .number({ error: 'Must be a number' })
    .int('Must be a whole number')
    .min(1, 'Minimum 1')
    .max(999, 'Maximum 999'),
  targetProvider: z.string().min(1, 'Required').max(100),
  targetModel: z.string().min(1, 'Required').max(100),
  minPromptLength: z.number().int().min(0).nullable().optional(),
  maxPromptLength: z.number().int().min(0).nullable().optional(),
  maxInputTokens: z.number().int().min(1).nullable().optional(),
  temperature: z
    .number({ error: 'Must be a number' })
    .min(0, 'Min 0.0')
    .max(2, 'Max 2.0')
    .nullable()
    .optional(),
  ragEnabledOnly: z.boolean().optional(),
  toolsRequiredOnly: z.boolean().optional(),
  structuredOutputOnly: z.boolean().optional(),
  fallbackPolicy: z.enum(['USE_DEFAULT_MODEL', 'FAIL_FAST']).optional(),
})

type FormValues = z.infer<typeof schema>

interface ModelRouteFormProps {
  open: boolean
  onClose: () => void
  assistantCode: string
  route?: ModelRouteDto
}

export function ModelRouteForm({ open, onClose, assistantCode, route }: ModelRouteFormProps) {
  const isEdit = !!route
  const create = useCreateModelRoute(assistantCode)
  const update = useUpdateModelRoute(assistantCode)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      routeName: '',
      routeType: 'SIMPLE',
      priority: 10,
      targetProvider: '',
      targetModel: '',
      minPromptLength: null,
      maxPromptLength: null,
      maxInputTokens: null,
      temperature: null,
      ragEnabledOnly: false,
      toolsRequiredOnly: false,
      structuredOutputOnly: false,
      fallbackPolicy: 'USE_DEFAULT_MODEL',
    },
  })

  const routeType = form.watch('routeType')

  const showLengthFields = routeType === 'SIMPLE' || routeType === 'LONG_CONTEXT'
  const showRag = routeType === 'KNOWLEDGE_QA'
  const showTools = routeType === 'TOOL_HEAVY'
  const showStructured = routeType === 'STRUCTURED_OUTPUT'

  useEffect(() => {
    if (open) {
      form.reset({
        routeName: route?.routeName ?? '',
        routeType: (route?.routeType as RouteType) ?? 'SIMPLE',
        priority: route?.priority ?? 10,
        targetProvider: route?.targetProvider ?? '',
        targetModel: route?.targetModel ?? '',
        minPromptLength: route?.minPromptLength ?? null,
        maxPromptLength: route?.maxPromptLength ?? null,
        maxInputTokens: route?.maxInputTokens ?? null,
        temperature: route?.temperature ?? null,
        ragEnabledOnly: route?.ragEnabledOnly ?? false,
        toolsRequiredOnly: route?.toolsRequiredOnly ?? false,
        structuredOutputOnly: route?.structuredOutputOnly ?? false,
        fallbackPolicy: (route as ModelRouteDto & { fallbackPolicy?: FallbackPolicy })?.fallbackPolicy ?? 'USE_DEFAULT_MODEL',
      })
    }
  }, [open, route, form])

  function handleSubmit(values: FormValues) {
    const onError = (err: ApiError) => {
      err.fieldErrors?.forEach((fe) =>
        form.setError(fe.field as keyof FormValues, { message: fe.message }),
      )
    }

    const payload = {
      routeName: values.routeName,
      routeType: values.routeType,
      priority: values.priority,
      targetProvider: values.targetProvider,
      targetModel: values.targetModel,
      minPromptLength: values.minPromptLength ?? null,
      maxPromptLength: values.maxPromptLength ?? null,
      maxInputTokens: values.maxInputTokens ?? null,
      temperature: values.temperature ?? null,
      ragEnabledOnly: values.ragEnabledOnly ?? false,
      toolsRequiredOnly: values.toolsRequiredOnly ?? false,
      structuredOutputOnly: values.structuredOutputOnly ?? false,
      fallbackPolicy: values.fallbackPolicy,
    }

    if (isEdit && route?.id !== undefined) {
      update.mutate({ id: route.id, req: payload }, { onSuccess: onClose, onError })
    } else {
      create.mutate(payload, { onSuccess: onClose, onError })
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit Route — ${route?.routeName}` : 'Add Model Route'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="model-route-form" loading={isPending}>
            {isEdit ? 'Save Changes' : 'Create Route'}
          </Button>
        </>
      }
    >
      <form
        id="model-route-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        {/* Row: name + priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Route Name"
            required
            placeholder="e.g. rag-route"
            error={form.formState.errors.routeName?.message}
            {...form.register('routeName')}
          />
          <Input
            label="Priority"
            required
            type="number"
            placeholder="1–999"
            hint="Lower number = higher priority"
            error={form.formState.errors.priority?.message}
            {...form.register('priority', { valueAsNumber: true })}
          />
        </div>

        {/* Route type */}
        <Select
          label="Route Type"
          required
          options={ROUTE_TYPES}
          error={form.formState.errors.routeType?.message}
          {...form.register('routeType')}
        />

        {/* Conditional: prompt length (SIMPLE, LONG_CONTEXT) */}
        {showLengthFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Min Prompt Length"
              type="number"
              placeholder="Characters (optional)"
              error={form.formState.errors.minPromptLength?.message}
              {...form.register('minPromptLength', {
                setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
              })}
            />
            <Input
              label="Max Prompt Length"
              type="number"
              placeholder="Characters (optional)"
              error={form.formState.errors.maxPromptLength?.message}
              {...form.register('maxPromptLength', {
                setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
              })}
            />
          </div>
        )}

        {/* Conditional: RAG only toggle (KNOWLEDGE_QA) */}
        {showRag && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Toggle
              label="RAG Enabled Only"
              checked={form.watch('ragEnabledOnly') ?? false}
              onChange={(v) => form.setValue('ragEnabledOnly', v)}
            />
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '42px' }}>
              Only route requests when RAG is active
            </p>
          </div>
        )}

        {/* Conditional: Tools required toggle (TOOL_HEAVY) */}
        {showTools && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Toggle
              label="Tools Required Only"
              checked={form.watch('toolsRequiredOnly') ?? false}
              onChange={(v) => form.setValue('toolsRequiredOnly', v)}
            />
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '42px' }}>
              Only route requests that require tool execution
            </p>
          </div>
        )}

        {/* Conditional: Structured output toggle (STRUCTURED_OUTPUT) */}
        {showStructured && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Toggle
              label="Structured Output Only"
              checked={form.watch('structuredOutputOnly') ?? false}
              onChange={(v) => form.setValue('structuredOutputOnly', v)}
            />
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '42px' }}>
              Only route requests that require structured output format
            </p>
          </div>
        )}

        {/* Row: target provider + model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Target Provider"
            required
            placeholder="e.g. openai"
            error={form.formState.errors.targetProvider?.message}
            {...form.register('targetProvider')}
          />
          <Input
            label="Target Model"
            required
            placeholder="e.g. gpt-4o"
            error={form.formState.errors.targetModel?.message}
            {...form.register('targetModel')}
          />
        </div>

        {/* Row: max tokens + temperature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Max Input Tokens"
            type="number"
            placeholder="Optional"
            error={form.formState.errors.maxInputTokens?.message}
            {...form.register('maxInputTokens', {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
          />
          <Input
            label="Temperature"
            type="number"
            placeholder="0.0 – 2.0 (optional)"
            hint="Leave blank to use assistant default"
            error={form.formState.errors.temperature?.message}
            {...form.register('temperature', {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
          />
        </div>

        {/* Fallback policy */}
        <Select
          label="Fallback Policy"
          options={FALLBACK_POLICIES}
          error={form.formState.errors.fallbackPolicy?.message}
          {...form.register('fallbackPolicy')}
        />
      </form>
    </Modal>
  )
}
