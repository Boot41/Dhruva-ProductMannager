import Button from './Button'
import { type Project } from '../Api/projects'

interface ProductCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onViewDetails?: (project: Project) => void
}

export default function ProductCard({ project, onEdit, onViewDetails }: ProductCardProps) {
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
          {project.name}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status || 'No Status'}
        </span>
      </div>
      
      <p className="text-[color:var(--color-secondary-600)] mb-4 text-sm">
        {project.description}
      </p>
      
      <div className="space-y-2 text-xs text-[color:var(--color-secondary-500)]">
        <div>Created: {formatDate(project.created_at)}</div>
        <div>Owner ID: {project.owner_id}</div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => onEdit?.(project)}
        >
          Edit
        </Button>
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => onViewDetails?.(project)}
        >
          View Details
        </Button>
      </div>
    </div>
  )
}
