import { useEffect, useState } from 'react'
import Button from './Button'
import type { UmlType } from './UmlComponent'

export type AddNodeData = {
  id: string
  name: string
  type: UmlType
  x: number
  y: number
  w: number
  h: number
  description?: string
}

export type AddNodeDialogProps = {
  open: boolean
  initial?: Partial<AddNodeData>
  saving?: boolean
  error?: string | null
  onCancel: () => void
  onSubmit: (data: AddNodeData) => void
}

const defaultInitial: AddNodeData = {
  id: '',
  name: '',
  type: 'service',
  x: 100,
  y: 100,
  w: 150,
  h: 100,
  description: '',
}

export default function AddNodeDialog({ open, initial, saving = false, error = null, onCancel, onSubmit }: AddNodeDialogProps) {
  const [form, setForm] = useState<AddNodeData>({ ...defaultInitial, ...(initial || {}) } as AddNodeData)

  useEffect(() => {
    setForm({ ...defaultInitial, ...(initial || {}) } as AddNodeData)
  }, [initial, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={() => !saving && onCancel()} />
      <div className="relative z-10 w-full max-w-[560px] rounded-lg bg-white p-6 shadow-xl">
        <h4 className="text-lg font-semibold text-[color:var(--color-secondary-900)] mb-4">Add Node</h4>

        {error && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-[color:var(--color-secondary-800)] mb-1">ID</label>
            <input
              type="text"
              className="w-full rounded border border-[color:var(--color-secondary-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.id}
              onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              disabled={saving}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-[color:var(--color-secondary-800)] mb-1">Name</label>
            <input
              type="text"
              className="w-full rounded border border-[color:var(--color-secondary-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-800)] mb-1">Type</label>
            <select
              className="w-full rounded border border-[color:var(--color-secondary-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as UmlType }))}
              disabled={saving}
            >
              <option value="service">Service</option>
              <option value="database">Database</option>
              <option value="load_balancer">Load Balancer</option>
              <option value="queue">Queue</option>
              <option value="cache">Cache</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-800)] mb-1">Description</label>
            <input
              type="text"
              className="w-full rounded border border-[color:var(--color-secondary-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.description || ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-800)] mb-1">X</label>
            <input
              type="number"
              className="w-full rounded border border-[color:var(--color-secondary-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.x}
              onChange={(e) => setForm((f) => ({ ...f, x: Number(e.target.value) }))}
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-800)] mb-1">Y</label>
            <input
              type="number"
              className="w-full rounded border border-[color:var(--color-secondary-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.y}
              onChange={(e) => setForm((f) => ({ ...f, y: Number(e.target.value) }))}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-800)] mb-1">Width (w)</label>
            <input
              type="number"
              className="w-full rounded border border-[color:var(--color-secondary-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.w}
              onChange={(e) => setForm((f) => ({ ...f, w: Number(e.target.value) }))}
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-800)] mb-1">Height (h)</label>
            <input
              type="number"
              className="w-full rounded border border-[color:var(--color-secondary-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.h}
              onChange={(e) => setForm((f) => ({ ...f, h: Number(e.target.value) }))}
              disabled={saving}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => onSubmit({
              id: form.id.trim() || form.name.trim(),
              name: form.name.trim() || form.id.trim(),
              type: form.type,
              x: Number(form.x) || 0,
              y: Number(form.y) || 0,
              w: Number(form.w) || 150,
              h: Number(form.h) || 100,
              description: form.description || '',
            })}
            disabled={saving || !(form.id || form.name)}
          >
            {saving ? 'Adding...' : 'Add Node'}
          </Button>
        </div>
      </div>
    </div>
  )
}
