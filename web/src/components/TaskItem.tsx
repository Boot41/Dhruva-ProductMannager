import { useEffect, useState } from 'react'
import { type TaskAssignment, updateTaskAssignment } from '../Api/tasks'
import StatusSlider from './StatusSlider'

interface TaskItemProps {
  task: TaskAssignment
  onTaskUpdated: () => void
}

export default function TaskItem({ task: t, onTaskUpdated }: TaskItemProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const statuses = ['assigned', 'todo', 'in progress', 'sent for approval', 'approved', 'done'] as const
  const currentStatusIndex = statuses.indexOf((t.status as typeof statuses[number]) || 'todo')
  const [sliderValue, setSliderValue] = useState(currentStatusIndex === -1 ? 0 : currentStatusIndex)

  // keep local slider in sync when task status changes via refresh
  useEffect(() => {
    const idx = statuses.indexOf((t.status as typeof statuses[number]) || 'todo')
    setSliderValue(idx === -1 ? 0 : idx)
  }, [t.id, t.status])

  const handleStatusChange = async (index: number) => {
    const newStatus = statuses[index]
    setSliderValue(index)
    try {
      await updateTaskAssignment(t.id, { status: newStatus })
      onTaskUpdated()
    } catch (error: any) {
      console.error('Failed to update task status:', error)
      if (error.message && error.message.includes('already assigned')) {
        alert('Task is already assigned.') // Placeholder for snackbar
      } else {
        alert('Failed to update task status. Please try again.')
      }
    }
  }

  return (
    <div
      key={t.id}
      className="bg-white border border-[color:var(--color-secondary-200)] rounded-md p-4 cursor-pointer"
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    >
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
          {t.status === 'assigned' && (
            <button
              className="mt-2 px-3 py-1 text-xs rounded bg-[color:var(--color-primary-500)] text-white hover:bg-[color:var(--color-primary-600)]"
              onClick={(e) => {
                e.stopPropagation() // Prevent opening the dropdown
                handleStatusChange(statuses.indexOf('todo'))
              }}
            >
              Accept Task
            </button>
          )}
        </div>
      </div>
      {isDropdownOpen && (
        <StatusSlider
          id={`status-slider-${t.id}`}
          statuses={statuses}
          value={sliderValue}
          onChange={handleStatusChange}
        />
      )}
    </div>
  )
}
