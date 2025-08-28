import { useEffect, useState } from 'react'
import { listMyTaskAssignments, type TaskAssignment } from '../Api/tasks'
import Button from '../components/Button'
import TaskCreateFormDialog from '../components/TaskCreateFormDialog'
import TaskItem from '../components/TaskItem'

export default function Tasks() {
  const [items, setItems] = useState<TaskAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)

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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--color-secondary-900)] mb-2">My Tasks</h1>
          <p className="text-[color:var(--color-secondary-600)]">Tasks assigned to you across projects</p>
        </div>
        <Button onClick={() => setIsCreateFormOpen(true)}>Assign New Task</Button>
      </div>

      <TaskCreateFormDialog
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onCreated={triggerRefresh}
      />

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
          <TaskItem key={t.id} task={t} />
        ))}
      </div>
    </div>
  )
}
