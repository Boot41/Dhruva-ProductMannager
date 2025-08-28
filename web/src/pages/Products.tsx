import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import ProductCard from '../components/ProductCard'
import { getProjects, createProject, type Project, type ProjectCreate, getUserProjects } from '../Api/projects'
import { getCurrentUser, type User } from '../Api/auth'
import ChatBubble from '../components/ChatBubble'

export default function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    status: 'development'
  })
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadProjects(currentUser.id)
    }
  }, [currentUser])

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (err) {
      console.error('Error loading current user:', err)
    }
  }

  const loadProjects = async (userId: number) => {
    try {
      setLoading(true)
      setError(null)
      const projects = await getUserProjects(userId)
      setProducts(projects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async () => {
    if (newProduct.name.trim() && newProduct.description.trim()) {
      try {
        setError(null)
        const projectData: ProjectCreate = {
          name: newProduct.name,
          description: newProduct.description,
          status: newProduct.status
        }
        const createdProject = await createProject(projectData)
        setProducts([createdProject, ...products])
        setNewProduct({ name: '', description: '', status: 'development' })
        setShowCreateForm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create project')
        console.error('Error creating project:', err)
      }
    }
  }

  const handleEditProject = (project: Project) => {
    // TODO: Implement edit functionality
    console.log('Edit project:', project)
  }

  const handleViewDetails = (project: Project) => {
    navigate(`/projects/${project.id}/overview`)
  }

  if (loading) {
    return (
      <div className=" mx-auto px-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-[color:var(--color-secondary-600)]">Loading projects...</div>
        </div>
      </div>
    )
  }

  return (
    <div className=" mx-auto px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[color:var(--color-secondary-900)] mb-2">
              Projects
            </h1>
            <p className="text-[color:var(--color-secondary-600)]">
              Manage your project portfolio and track development progress
            </p>
          </div>
          {currentUser?.role === 'owner' && (
            <Button onClick={() => navigate('/projects/add')}>
              Create Project
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white rounded-lg border border-[color:var(--color-secondary-200)] p-6 mb-6">
            <h3 className="text-lg font-semibold text-[color:var(--color-secondary-900)] mb-4">
              Create New Project
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-2">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-2">
                  Status
                </label>
                <select
                  value={newProduct.status}
                  onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                  className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="development">Development</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCreateProduct}>
                  Create Project
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewProduct({ name: '', description: '', status: 'development' })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((project) => (
          <ProductCard
            key={project.id}
            project={project}
            onEdit={handleEditProject}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {products.length === 0 && !loading && currentUser?.role === 'owner' && (
        <div className="text-center py-12">
          <div className="text-[color:var(--color-secondary-500)] mb-4">
            No projects found
          </div>
          <Button onClick={() => navigate('/projects/add')}>
            Create Your First Project
          </Button>
        </div>
      )}
      <ChatBubble />
    </div>
  )
}
