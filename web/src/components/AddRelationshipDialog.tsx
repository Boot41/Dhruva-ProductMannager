import { useEffect, useState } from 'react'
import Button from './Button'

export type AddRelationshipData = {
  source: string
  to: string
  type: string
}

export type AddRelationshipDialogProps = {
  open: boolean
  nodeIds: string[]
  initial?: Partial<AddRelationshipData>
  saving?: boolean
  error?: string | null
  onCancel: () => void
  onSubmit: (data: AddRelationshipData) => void
}

const defaultInitial: AddRelationshipData = {
  source: '',
  to: '',
  type: 'dependency',
}

export default function AddRelationshipDialog({ open, nodeIds, initial, saving = false, error = null, onCancel, onSubmit }: AddRelationshipDialogProps) {
  const [form, setForm] = useState<AddRelationshipData>({ ...defaultInitial, ...(initial || {}) } as AddRelationshipData)

  useEffect(() => {
    setForm({ ...defaultInitial, ...(initial || {}) } as AddRelationshipData)
  }, [initial, open])

  if (!open) return null

  const canSubmit = form.source && form.to && form.source !== form.to

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={() => !saving && onCancel()} />
      <div className="relative z-10 w-full max-w-[480px] rounded-lg bg-white p-6 shadow-xl">
        <h4 className="text-lg font-semibold text-[color:var(--color-secondary-900)] mb-4">Add Relationship</h4>

        {error && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-800)] mb-1">Source</label>
            <select
              className="w-full rounded border border-[color:var(--color-secondary-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              disabled={saving}
            >
              <option value="">Select source node</option>
              {nodeIds.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-800)] mb-1">To</label>
            <select
              className="w-full rounded border border-[color:var(--color-secondary-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.to}
              onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
              disabled={saving}
            >
              <option value="">Select target node</option>
              {nodeIds.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-800)] mb-1">Type</label>
            <input
              type="text"
              placeholder="e.g., payment, reads_writes, calls"
              className="w-full rounded border border-[color:var(--color-secondary-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              disabled={saving}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => onSubmit({ source: form.source, to: form.to, type: form.type || 'dependency' })}
            disabled={saving || !canSubmit}
          >
            {saving ? 'Adding...' : 'Add Relationship'}
          </Button>
        </div>
      </div>
    </div>
  )
}
