import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
  useToolPolicies,
  useCreateToolPolicy,
  useUpdateToolPolicy,
  useToggleToolPolicy,
  useDeleteToolPolicy,
} from './hooks/usePolicies'
import { formatDate } from '@/utils/formatters'
import type { ToolPolicyDto, ToolType } from '@/types/api'
import type { ApiError } from '@/api/client'
import type { Column } from '@/components/ui/DataTable'

const TOOL_TYPE_OPTIONS = [
  { value: 'LOCAL_BEAN', label: 'Local Bean' },
  { value: 'REST', label: 'REST' },
  { value: 'MCP', label: 'MCP' },
]

const toolSchema = z.object({
  toolName: z.string().min(1, 'Required').max(255, 'Max 255 characters'),
  toolType: z.enum(['LOCAL_BEAN', 'REST', 'MCP']),
  enabled: z.boolean(),
  requiresApproval: z.boolean(),
  timeoutMs: z
    .string()
    .optional()
    .transform((v) => (v === '' || v == null ? null : parseInt(v, 10)))
    .pipe(z.number().int().min(1).max(300000).nullable()),
})

type ToolFormValues = z.infer<typeof toolSchema>
type RawToolFormValues = {
  toolName: string
  toolType: ToolType
  enabled: boolean
  requiresApproval: boolean
  timeoutMs: string
}

interface ToolFormModalProps {
  open: boolean
  onClose: () => void
  assistantCode: string
  editTool?: ToolPolicyDto
}

function ToolFormModal({ open, onClose, assistantCode, editTool }: ToolFormModalProps) {
  const isEdit = !!editTool
  const create = useCreateToolPolicy(assistantCode)
  const update = useUpdateToolPolicy(assistantCode)
  const isPending = create.isPending || update.isPending

  const form = useForm<RawToolFormValues>({
    defaultValues: {
      toolName: editTool?.toolName ?? '',
      toolType: (editTool?.toolType as ToolType) ?? 'LOCAL_BEAN',
      enabled: editTool?.enabled ?? true,
      requiresApproval: editTool?.requiresApproval ?? false,
      timeoutMs: editTool?.timeoutMs != null ? String(editTool.timeoutMs) : '',
    },
  })

  // Reset when tool changes
  useState(() => {
    if (open) {
      form.reset({
        toolName: editTool?.toolName ?? '',
        toolType: (editTool?.toolType as ToolType) ?? 'LOCAL_BEAN',
        enabled: editTool?.enabled ?? true,
        requiresApproval: editTool?.requiresApproval ?? false,
        timeoutMs: editTool?.timeoutMs != null ? String(editTool.timeoutMs) : '',
      })
    }
  })

  function handleSubmit(raw: RawToolFormValues) {
    const parsed = toolSchema.parse(raw) as ToolFormValues

    const onError = (err: ApiError) => {
      err.fieldErrors?.forEach((fe) =>
        form.setError(fe.field as keyof RawToolFormValues, { message: fe.message }),
      )
    }

    if (isEdit && editTool?.id != null) {
      update.mutate(
        {
          id: editTool.id,
          req: {
            toolName: parsed.toolName,
            toolType: parsed.toolType,
            enabled: parsed.enabled,
            requiresApproval: parsed.requiresApproval,
            timeoutMs: parsed.timeoutMs,
          },
        },
        { onSuccess: onClose, onError },
      )
    } else {
      create.mutate(
        {
          toolName: parsed.toolName,
          toolType: parsed.toolType,
          enabled: parsed.enabled,
          requiresApproval: parsed.requiresApproval,
          timeoutMs: parsed.timeoutMs,
        },
        { onSuccess: onClose, onError },
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit Tool — ${editTool?.toolName}` : 'Add Tool Policy'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="tool-policy-form" loading={isPending}>
            {isEdit ? 'Save Changes' : 'Add Tool'}
          </Button>
        </>
      }
    >
      <form
        id="tool-policy-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        <Input
          label="Tool Name"
          required
          placeholder="e.g. searchKnowledgeBase"
          error={form.formState.errors.toolName?.message}
          disabled={isEdit}
          {...form.register('toolName')}
        />

        <Select
          label="Tool Type"
          required
          options={TOOL_TYPE_OPTIONS}
          error={form.formState.errors.toolType?.message}
          {...form.register('toolType')}
        />

        <Input
          label="Timeout (ms)"
          type="number"
          placeholder="e.g. 5000"
          hint="Max execution time in milliseconds (leave blank for no limit)"
          error={form.formState.errors.timeoutMs?.message}
          {...form.register('timeoutMs')}
        />

        {/* Toggles as checkboxes for simplicity inside modal */}
        <div
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {(
            [
              { name: 'enabled', label: 'Enabled', desc: 'Allow this tool to be invoked' },
              { name: 'requiresApproval', label: 'Requires Approval', desc: 'Pause execution for human approval' },
            ] as const
          ).map((item, i) => (
            <label
              key={item.name}
              className="flex items-center justify-between cursor-pointer"
              style={{
                padding: '10px 14px',
                borderBottom: i < 1 ? '1px solid var(--border)' : undefined,
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '1px' }}>{item.desc}</div>
              </div>
              <input
                type="checkbox"
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                {...form.register(item.name)}
              />
            </label>
          ))}
        </div>
      </form>
    </Modal>
  )
}

interface ToolPolicyTabProps {
  assistantCode: string
}

export function ToolPolicyTab({ assistantCode }: ToolPolicyTabProps) {
  const { data: tools, isLoading } = useToolPolicies(assistantCode)
  const toggle = useToggleToolPolicy(assistantCode)
  const del = useDeleteToolPolicy(assistantCode)

  const [formOpen, setFormOpen] = useState(false)
  const [editTool, setEditTool] = useState<ToolPolicyDto | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<ToolPolicyDto | undefined>()

  function handleNew() {
    setEditTool(undefined)
    setFormOpen(true)
  }

  function handleEdit(tool: ToolPolicyDto) {
    setEditTool(tool)
    setFormOpen(true)
  }

  function handleFormClose() {
    setFormOpen(false)
    setEditTool(undefined)
  }

  function handleToggleEnabled(tool: ToolPolicyDto) {
    if (tool.id == null) return
    toggle.mutate({ id: tool.id, enabled: !tool.enabled })
  }

  function handleDeleteConfirm() {
    if (!deleteTarget?.id) return
    del.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(undefined) })
  }

  const TOOL_TYPE_LABEL: Record<string, string> = {
    LOCAL_BEAN: 'Local Bean',
    REST: 'REST',
    MCP: 'MCP',
  }

  const columns: Column<ToolPolicyDto>[] = [
    {
      header: 'Tool Name',
      accessor: (row) => (
        <code
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '2px 6px',
            color: 'var(--text)',
          }}
        >
          {row.toolName ?? '—'}
        </code>
      ),
    },
    {
      header: 'Type',
      accessor: (row) => (
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {TOOL_TYPE_LABEL[row.toolType ?? ''] ?? row.toolType ?? '—'}
        </span>
      ),
      width: '110px',
    },
    {
      header: 'Enabled',
      accessor: (row) => (
        <button
          type="button"
          onClick={() => handleToggleEnabled(row)}
          disabled={toggle.isPending && toggle.variables?.id === row.id}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: row.enabled ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.10)',
            border: `1px solid ${row.enabled ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
            borderRadius: '4px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 600,
            color: row.enabled ? 'var(--green)' : 'var(--red)',
            cursor: 'pointer',
          }}
          aria-label={`Toggle ${row.toolName} enabled`}
        >
          {row.enabled ? '✓ Enabled' : '✗ Disabled'}
        </button>
      ),
      width: '110px',
    },
    {
      header: 'Approval',
      accessor: (row) => (
        <span style={{ fontSize: '12px', color: row.requiresApproval ? 'var(--yellow)' : 'var(--muted)' }}>
          {row.requiresApproval ? 'Required' : 'Auto'}
        </span>
      ),
      width: '90px',
    },
    {
      header: 'Timeout',
      accessor: (row) => (
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {row.timeoutMs != null ? `${row.timeoutMs} ms` : '—'}
        </span>
      ),
      width: '100px',
    },
    {
      header: 'Created',
      accessor: (row) => (
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{formatDate(row.createdAt)}</span>
      ),
      width: '140px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Actions',
      width: '110px',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {tools ? `${tools.length} tool${tools.length !== 1 ? 's' : ''} configured` : ''}
        </span>
        <Button onClick={handleNew}>+ Add Tool</Button>
      </div>

      <div className="overflow-x-auto">
        <DataTable<ToolPolicyDto>
          columns={columns}
          data={tools ?? []}
          loading={isLoading}
          emptyMessage="No tool policies configured. Click '+ Add Tool' to allow a tool."
          keyExtractor={(row) => row.id ?? `${row.toolName}-${row.toolType}`}
        />
      </div>

      <ToolFormModal
        open={formOpen}
        onClose={handleFormClose}
        assistantCode={assistantCode}
        editTool={editTool}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        onConfirm={handleDeleteConfirm}
        title={`Delete tool "${deleteTarget?.toolName}"?`}
        message="This tool will be removed from the assistant's allow-list. Existing sessions are not affected."
        confirmLabel="Delete"
        danger
        loading={del.isPending}
      />
    </>
  )
}
