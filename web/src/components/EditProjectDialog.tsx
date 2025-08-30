import Button from './Button'
import { useEffect, useState } from 'react'
import type { ProjectUpdate } from '../Api/projects'

export type EditProjectDialogProps = {
  open: boolean
  initial: ProjectUpdate
  saving?: boolean
  error?: string | null
  onCancel: () => void
  onSubmit: (data: ProjectUpdate) => void
}

export default function EditProjectDialog({ open, initial, saving = false, error = null, onCancel, onSubmit }: EditProjectDialogProps) {
  const [form, setForm] = useState<ProjectUpdate>(initial)

  useEffect(() => {
    setForm(initial)
  }, [initial, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={() => !saving && onCancel()} />
      <div className="relative z-10 w-full max-w-[500px] rounded-lg bg-white p-6 shadow-xl">
        <h4 className="text-lg font-semibold text-[color:var(--color-secondary-900)] mb-4">Edit Project</h4>

        {error && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-800)] mb-1">Name</label>
            <input
              type="text"
              className="w-full rounded border border-[color:var(--color-secondary-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.name || ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-800)] mb-1">Description</label>
            <textarea
              className="w-full rounded border border-[color:var(--color-secondary-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={form.description || ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              disabled={saving}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={() => onSubmit({
            name: form.name?.trim() || '',
            description: form.description || '',
          })} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
