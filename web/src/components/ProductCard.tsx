import Button from './Button'
import { useEffect, useState } from 'react'
import { type Project, type ProjectUpdate, updateProject, deleteProject } from '../Api/projects'
import EditProjectDialog from './EditProjectDialog'

interface ProductCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onViewDetails?: (project: Project) => void
  onDelete?: (id: number) => void   // new callback
}

export default function ProductCard({ project, onEdit, onViewDetails, onDelete }: ProductCardProps) {
  const [localProject, setLocalProject] = useState<Project>(project)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLocalProject(project)
  }, [project])

  const openEdit = () => {
    setIsEditing(true)
  }

  const handleSubmit = async (data: ProjectUpdate) => {
    try {
      setSaving(true)
      setError(null)
      const updated = await updateProject(localProject.id, data)
      setLocalProject(updated)
      onEdit?.(updated)
      setIsEditing(false)
    } catch (e: any) {
      setError(e?.message || 'Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${localProject.name}"?`)) return
    console.log('Attempting to delete project with ID:', localProject.id);
    try {
      setDeleting(true)
      await deleteProject(localProject.id)
      console.log('Project deleted successfully on backend.');
      onDelete?.(localProject.id)   // notify parent
    } catch (e: any) {
      setError(e?.message || 'Failed to delete project')
      console.error('Error deleting project on backend:', e);
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'development':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'on-hold':
      case 'paused':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-[color:var(--color-secondary-200)] p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-[color:var(--color-secondary-900)]">
          {localProject.name}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(localProject.status)}`}>
          {localProject.status || 'No Status'}
        </span>
      </div>
      
      <p className="text-[color:var(--color-secondary-600)] mb-4 text-sm">
        {localProject.description}
      </p>
      
      <div className="space-y-2 text-xs text-[color:var(--color-secondary-500)]">
        <div>Created: {formatDate(localProject.created_at)}</div>
        <div>Owner ID: {localProject.owner_id}</div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <Button 
          size="sm" 
          variant="secondary"
          onClick={openEdit}
        >
          Edit
        </Button>
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => onViewDetails?.(localProject)}
        >
          View Details
        </Button>
        <Button 
          size="sm" 
          variant="primary"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

      <EditProjectDialog
        open={isEditing}
        initial={{
          name: localProject.name,
          description: localProject.description,
          status: localProject.status,
        }}
        saving={saving}
        error={error}
        onCancel={() => setIsEditing(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
