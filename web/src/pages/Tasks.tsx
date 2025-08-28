import { useEffect, useState, type FormEvent } from 'react'
import { listMyTaskAssignments, createTaskAssignment, type TaskAssignment, type TaskAssignmentCreate } from '../Api/tasks'
import { getCurrentUser, type User } from '../Api/auth'
import { getProjects, type Project } from '../Api/projects'
import Button from '../components/Button'

export default function Tasks() {
  const [items, setItems] = useState<TaskAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await listMyTaskAssignments()
        if (mounted) setItems(res)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load tasks')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [refreshToken])

  const triggerRefresh = () => setRefreshToken((x) => x + 1)

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[color:var(--color-secondary-900)] mb-2">My Tasks</h1>
        <p className="text-[color:var(--color-secondary-600)]">Tasks assigned to you across projects</p>
      </div>

      <TaskCreateForm onCreated={triggerRefresh} />

      {loading && (
        <div className="text-[color:var(--color-secondary-600)]">Loading...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="text-[color:var(--color-secondary-600)]">No tasks assigned to you yet.</div>
      )}

      <div className="grid gap-4">
        {items.map((t) => (
          <div key={t.id} className="bg-white border border-[color:var(--color-secondary-200)] rounded-md p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-[color:var(--color-secondary-500)]">Project #{t.project_id}</div>
                <div className="font-semibold text-[color:var(--color-secondary-900)]">{t.type || 'Task'}</div>
                {t.description && (
                  <div className="mt-1 text-[color:var(--color-secondary-700)]">{t.description}</div>
                )}
              </div>
              <div className="text-right">
                <div className="inline-block px-2 py-1 text-xs rounded bg-[color:var(--color-secondary-100)] text-[color:var(--color-secondary-800)]">
                  {t.status || 'todo'}
                </div>
                <div className="mt-2 text-xs text-[color:var(--color-secondary-500)]">
                  Assigned {new Date(t.created_at).toLocaleString()}
                </div>
                {t.eta && (
                  <div className="text-xs text-[color:var(--color-secondary-500)]">ETA {new Date(t.eta).toLocaleString()}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TaskCreateForm({ onCreated }: { onCreated?: () => void }) {
  const [me, setMe] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<{
    project_id: number | ''
    type: string
    description: string
    status: 'todo' | 'in-progress' | 'blocked' | 'done'
    eta: string
  }>({ project_id: '', type: '', description: '', status: 'todo', eta: '' })

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [user, projs] = await Promise.all([getCurrentUser(), getProjects()])
        if (mounted) {
          setMe(user)
          setProjects(projs)
        }
      } catch (e) {
        // ignore; header will manage login elsewhere
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!me || !form.project_id) return
    try {
      setSubmitting(true)
      setError(null)
      const payload: TaskAssignmentCreate = {
        user_id: me.id,
        project_id: Number(form.project_id),
        type: form.type || undefined,
        description: form.description || undefined,
        status: form.status,
        eta: form.eta || undefined,
      }
      await createTaskAssignment(payload)
      setForm({ project_id: '', type: '', description: '', status: 'todo', eta: '' })
      onCreated && onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-[color:var(--color-secondary-200)] p-4 mb-6">
      <h3 className="text-lg font-semibold text-[color:var(--color-secondary-900)] mb-4">Assign a new task to me</h3>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4">{error}</div>
      )}
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-1">Project</label>
          <select
            value={form.project_id}
            onChange={(e) => setForm((f) => ({ ...f, project_id: (e.target as HTMLSelectElement).value ? Number((e.target as HTMLSelectElement).value) : '' }))}
            className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md"
            required
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-1">Type</label>
          <input
            type="text"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            placeholder="feature, bug, chore..."
            className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md"
            placeholder="Describe the task..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: (e.target as HTMLSelectElement).value as any }))}
            className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md"
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-1">ETA</label>
          <input
            type="datetime-local"
            value={form.eta}
            onChange={(e) => setForm((f) => ({ ...f, eta: e.target.value }))}
            className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md"
          />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={submitting || !me}>
            {submitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  )
}
