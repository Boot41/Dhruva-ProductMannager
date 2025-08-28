import { type TaskAssignment, updateTaskAssignment } from '../Api/tasks'

interface TaskItemProps {
  task: TaskAssignment
  onTaskUpdated: () => void
}

export default function TaskItem({ task: t, onTaskUpdated }: TaskItemProps) {
  const handleMarkAsDone = async () => {
    try {
      await updateTaskAssignment(t.id, { status: 'done' })
      onTaskUpdated()
    } catch (error) {
      console.error('Failed to mark task as done:', error)
      alert('Failed to mark task as done. Please try again.')
    }
  }

  return (
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
          {t.status !== 'done' && (
            <button
              onClick={handleMarkAsDone}
              className="mt-2 px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Mark as Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
