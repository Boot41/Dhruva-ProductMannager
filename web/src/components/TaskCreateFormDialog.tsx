import { useEffect, useState, type FormEvent } from 'react'
import { createTaskAssignment, type TaskAssignmentCreate } from '../Api/tasks'
import { getCurrentUser, type User } from '../Api/auth'
import { getUserProjects, type Project } from '../Api/projects'
import { searchEmployees } from '../Api/user' // Import searchEmployees
import Button from './Button'

interface TaskCreateFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function TaskCreateFormDialog({ isOpen, onClose, onCreated }: TaskCreateFormDialogProps) {
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
    assigned_user_id: number | '' // New field for assigned user
  }>({ project_id: '', type: '', description: '', status: 'todo', eta: '', assigned_user_id: '' })

  const [assignedUser, setAssignedUser] = useState<User | null>(null)
  const [assignedUserSearchQuery, setAssignedUserSearchQuery] = useState<string>('')
  const [assignedUserSearchResults, setAssignedUserSearchResults] = useState<User[]>([])
  const [searchingUsers, setSearchingUsers] = useState<boolean>(false)
  const [assignedUserSearchError, setAssignedUserSearchError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return; // Only load data when dialog is open
    let mounted = true
    async function load() {
      try {
        const user = await getCurrentUser()
        if (!user) throw new Error('Not logged in')                                                                  
        const projs = await getUserProjects(user.id) 
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
  }, [isOpen])

  const handleSearchUsers = async () => {
    if (!me || !me.company || !assignedUserSearchQuery) return

    setSearchingUsers(true)
    setAssignedUserSearchError(null)
    try {
      const results = await searchEmployees(me.company, assignedUserSearchQuery)
      const filteredResults = results.filter(user => (user.level ?? 10) <= (me?.level || 0))
      setAssignedUserSearchResults(filteredResults)
    } catch (err) {
      setAssignedUserSearchError(err instanceof Error ? err.message : 'Failed to search users')
    } finally {
      setSearchingUsers(false)
    }
  }

  const handleSelectAssignedUser = (user: User) => {
    setAssignedUser(user)
    setForm((f) => ({ ...f, assigned_user_id: user.id }))
    setAssignedUserSearchResults([]) // Clear search results after selection
    setAssignedUserSearchQuery(user.name) // Display selected user's name in search input
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!me || !form.project_id) return
    try {
      setSubmitting(true)
      setError(null)
      const payload: TaskAssignmentCreate = {
        user_id: assignedUser?.id || me.id, // Use assignedUser.id if selected, otherwise me.id
        project_id: Number(form.project_id),
        type: form.type || undefined,
        description: form.description || undefined,
        status: form.status,
        eta: form.eta || undefined,
      }
      await createTaskAssignment(payload)
      setForm({ project_id: '', type: '', description: '', status: 'todo', eta: '', assigned_user_id: '' })
      setAssignedUser(null) // Clear assigned user
      setAssignedUserSearchQuery('') // Clear search query
      onCreated && onCreated()
      onClose(); // Close dialog on successful creation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-[500px] mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[color:var(--color-secondary-900)]">Assign a new task</h3>
          <button onClick={onClose} className="text-[color:var(--color-secondary-500)] hover:text-[color:var(--color-secondary-700)]">
            &times;
          </button>
        </div>
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
            <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-1">Assign to User</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={assignedUserSearchQuery}
                onChange={(e) => {
                  setAssignedUserSearchQuery(e.target.value)
                  setAssignedUser(null) // Clear selection if user types
                  setForm((f) => ({ ...f, assigned_user_id: '' }))
                }}
                placeholder="Search user by name..."
                className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md"
              />
              <Button onClick={handleSearchUsers} type="button" disabled={searchingUsers || !me?.company}>
                {searchingUsers ? 'Searching...' : 'Search'}
              </Button>
            </div>
            {assignedUserSearchError && (
              <div className="text-red-500 text-sm mt-1">{assignedUserSearchError}</div>
            )}
            {assignedUserSearchResults.length > 0 && (
              <ul className="border border-[color:var(--color-secondary-300)] rounded-md mt-2 max-h-40 overflow-y-auto">
                {assignedUserSearchResults.map((user) => (
                  <li
                    key={user.id}
                    className="px-3 py-2 cursor-pointer hover:bg-[color:var(--color-secondary-100)]"
                    onClick={() => handleSelectAssignedUser(user)}
                  >
                    {user.name} ({user.email})
                  </li>
                ))}
              </ul>
            )}
            {assignedUser && (
              <div className="mt-2 text-sm text-[color:var(--color-secondary-700)]">
                Assigned to: {assignedUser.name} ({assignedUser.email})
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={submitting || !me}>
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}