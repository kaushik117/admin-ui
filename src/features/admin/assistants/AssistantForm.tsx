import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useCreateAssistant, useUpdateAssistant } from './hooks/useAssistants'
import type { ApiError } from '@/api/client'
import type { AssistantSummary } from '@/types/api'

const schema = z.object({
  assistantCode: z
    .string()
    .min(1, 'Required')
    .max(100, 'Max 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, digits, and hyphens only'),
  name: z.string().min(1, 'Required').max(255, 'Max 255 characters'),
  description: z.string().max(1024, 'Max 1024 characters').optional(),
  tenantScope: z.string().max(100, 'Max 100 characters').optional(),
})

type FormValues = z.infer<typeof schema>

interface AssistantFormProps {
  open: boolean
  onClose: () => void
  assistant?: AssistantSummary
}

export function AssistantForm({ open, onClose, assistant }: AssistantFormProps) {
  const isEdit = !!assistant
  const create = useCreateAssistant()
  const update = useUpdateAssistant()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { assistantCode: '', name: '', description: '', tenantScope: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        assistantCode: assistant?.assistantCode ?? '',
        name: assistant?.name ?? '',
        description: '',
        tenantScope: assistant?.tenantScope ?? '',
      })
    }
  }, [open, assistant, form])

  function handleSubmit(values: FormValues) {
    const onError = (err: ApiError) => {
      err.fieldErrors?.forEach((fe) =>
        form.setError(fe.field as keyof FormValues, { message: fe.message }),
      )
    }

    if (isEdit) {
      update.mutate(
        {
          assistantCode: assistant.assistantCode,
          req: {
            name: values.name,
            description: values.description || null,
            tenantScope: values.tenantScope || null,
          },
        },
        { onSuccess: onClose, onError },
      )
    } else {
      create.mutate(
        {
          assistantCode: values.assistantCode,
          name: values.name,
          description: values.description || null,
          tenantScope: values.tenantScope || null,
        },
        { onSuccess: onClose, onError },
      )
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit Assistant — ${assistant.assistantCode}` : 'New Assistant'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="assistant-form" loading={isPending}>
            {isEdit ? 'Save Changes' : 'Create Assistant'}
          </Button>
        </>
      }
    >
      <form
        id="assistant-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        {isEdit ? (
          /* Edit mode: read-only code + editable name side by side */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span
                className="text-[11px] font-bold uppercase tracking-[.4px]"
                style={{ color: 'var(--muted)' }}
              >
                Assistant Code
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
                {assistant.assistantCode}
              </code>
            </div>
            <Input
              label="Name"
              required
              error={form.formState.errors.name?.message}
              {...form.register('name')}
            />
          </div>
        ) : (
          /* Create mode: code + name in 2-col grid, no hints (use placeholder) */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Assistant Code"
              required
              placeholder="e.g. loan-advisor"
              error={form.formState.errors.assistantCode?.message}
              {...form.register('assistantCode')}
            />
            <Input
              label="Name"
              required
              placeholder="e.g. RAHI Loan Advisor"
              error={form.formState.errors.name?.message}
              {...form.register('name')}
            />
          </div>
        )}

        <Textarea
          label="Description"
          placeholder="Brief description of what this assistant does…"
          maxLength={1024}
          showCount
          rows={3}
          value={form.watch('description') ?? ''}
          error={form.formState.errors.description?.message}
          {...form.register('description')}
        />

        <Input
          label="Tenant Scope"
          placeholder="e.g. rahi-prod  (leave blank for global)"
          error={form.formState.errors.tenantScope?.message}
          {...form.register('tenantScope')}
        />
      </form>
    </Modal>
  )
}
