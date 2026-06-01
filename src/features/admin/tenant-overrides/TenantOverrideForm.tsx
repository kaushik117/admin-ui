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
import { useCreateTenantOverride, useUpdateTenantOverride } from './hooks/useTenantOverrides'
import { useAssistants } from '@/features/admin/assistants/hooks/useAssistants'
import type { ApiError } from '@/api/client'
import type { TenantOverrideDto } from '@/types/api'

const OVERRIDE_TYPE_OPTIONS = [
  { value: 'MODEL_ROUTE', label: 'MODEL_ROUTE' },
  { value: 'RAG_POLICY', label: 'RAG_POLICY' },
  { value: 'MEMORY_POLICY', label: 'MEMORY_POLICY' },
  { value: 'TOOL_POLICY', label: 'TOOL_POLICY' },
  { value: 'SAFETY_POLICY', label: 'SAFETY_POLICY' },
  { value: 'RESPONSE_POLICY', label: 'RESPONSE_POLICY' },
]

const schema = z.object({
  tenantId: z.string().min(1, 'Required').max(255, 'Max 255 characters'),
  assistantCode: z.string().min(1, 'Required'),
  overrideType: z.string().min(1, 'Required'),
  overridePayloadJson: z
    .string()
    .min(1, 'Required')
    .refine(
      (s) => { try { JSON.parse(s); return true } catch { return false } },
      'Must be valid JSON',
    ),
  active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface TenantOverrideFormProps {
  open: boolean
  onClose: () => void
  override?: TenantOverrideDto
}

export function TenantOverrideForm({ open, onClose, override }: TenantOverrideFormProps) {
  const isEdit = !!override
  const create = useCreateTenantOverride()
  const update = useUpdateTenantOverride()
  const { data: assistants } = useAssistants()

  const assistantOptions = (assistants ?? []).map((a) => ({
    value: a.assistantCode,
    label: `${a.name} (${a.assistantCode})`,
  }))

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: '',
      assistantCode: '',
      overrideType: 'MODEL_ROUTE',
      overridePayloadJson: '{}',
      active: true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        tenantId: override?.tenantId ?? '',
        assistantCode: override?.assistantCode ?? '',
        overrideType: override?.overrideType ?? 'MODEL_ROUTE',
        overridePayloadJson: override?.overridePayloadJson ?? '{}',
        active: override?.active ?? true,
      })
    }
  }, [open, override, form])

  function handleSubmit(values: FormValues) {
    const onError = (err: ApiError) => {
      err.fieldErrors?.forEach((fe) =>
        form.setError(fe.field as keyof FormValues, { message: fe.message }),
      )
    }

    if (isEdit) {
      update.mutate(
        {
          id: override.id!,
          req: {
            overrideType: values.overrideType,
            overridePayloadJson: values.overridePayloadJson,
            active: values.active,
          },
        },
        { onSuccess: onClose, onError },
      )
    } else {
      create.mutate(
        {
          tenantId: values.tenantId,
          assistantCode: values.assistantCode,
          overrideType: values.overrideType,
          overridePayloadJson: values.overridePayloadJson,
        },
        { onSuccess: onClose, onError },
      )
    }
  }

  const isPending = create.isPending || update.isPending
  const payloadValue = form.watch('overridePayloadJson') ?? ''

  const readOnlyCell = (label: string, value: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span
        className="text-[11px] font-bold uppercase tracking-[.4px]"
        style={{ color: 'var(--muted)' }}
      >
        {label}
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
        {value}
      </code>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit Override: ${override.tenantId} / ${override.assistantCode}` : 'Add Tenant Override'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="tenant-override-form" loading={isPending}>
            {isEdit ? 'Save Changes' : 'Create Override'}
          </Button>
        </>
      }
    >
      <form
        id="tenant-override-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        {/* Tenant ID + Assistant Code */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {isEdit ? (
            <>
              {readOnlyCell('Tenant ID', override.tenantId ?? '')}
              {readOnlyCell('Assistant Code', override.assistantCode ?? '')}
            </>
          ) : (
            <>
              <Input
                label="Tenant ID"
                required
                placeholder="e.g. tenant-acme"
                hint="Unique identifier for the tenant"
                error={form.formState.errors.tenantId?.message}
                {...form.register('tenantId')}
              />
              <Select
                label="Assistant Code"
                required
                placeholder="Select assistant…"
                options={assistantOptions}
                error={form.formState.errors.assistantCode?.message}
                {...form.register('assistantCode')}
              />
            </>
          )}
        </div>

        {/* Override Type */}
        <Select
          label="Override Type"
          required
          options={OVERRIDE_TYPE_OPTIONS}
          error={form.formState.errors.overrideType?.message}
          {...form.register('overrideType')}
        />

        {/* Payload JSON */}
        <Textarea
          label="Override Payload (JSON)"
          required
          rows={6}
          value={payloadValue}
          placeholder='{"memoryEnabled": true, "storeType": "JDBC"}'
          hint="JSON object merged on top of the base assistant config at resolution time"
          error={form.formState.errors.overridePayloadJson?.message}
          className="font-mono text-[11px]"
          {...form.register('overridePayloadJson')}
        />

        {/* Active toggle (edit mode only) */}
        {isEdit && (
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
                  Enable or disable this override for the tenant
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
        )}
      </form>
    </Modal>
  )
}
