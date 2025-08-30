import { getAuthToken } from './auth'

export type Milestone = {
  name: string
  done: boolean
}

export type Feature = {
  id: number
  name: string
  status: string
}

export type StackTech = {
  tech: string
  level: number
}

export type Project = {
  id: number
  name: string
  description: string
  owner_id: number
  status: string
  created_at: string
  lead?: number
  features?: Feature[]
  stack?: StackTech[]
  progress?: {
    percent: number
    milestones: Milestone[]
  }
}

export type ProjectCreate = {
  name: string
  description: string
  status: string
  lead?: string
}

export type ProjectUpdate = Partial<Project>

export type UserProject = {
  id: number
  user_id: number
  project_id: number
  role: string
  created_at: string
}

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000'

async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function getProjects(): Promise<Project[]> {
  return makeAuthenticatedRequest('/projects/get')
}

export async function createProject(projectData: ProjectCreate): Promise<Project> {
  return makeAuthenticatedRequest('/projects/add', {
    method: 'POST',
    body: JSON.stringify(projectData),
  })
}

export async function getProject(projectId: number): Promise<Project> {
  return makeAuthenticatedRequest(`/projects/${projectId}`)
}

export async function updateProject(projectId: number, data: ProjectUpdate): Promise<Project> {
  return makeAuthenticatedRequest(`/projects/${projectId}` , {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function getAllProjects(): Promise<Project[]> {
  return makeAuthenticatedRequest('/projects/all/public')
}

export async function getUserProjects(userId: number): Promise<Project[]> {
  const userProjectAssociations: UserProject[] = await makeAuthenticatedRequest(`/user-projects/user/${userId}`)
  const projectPromises = userProjectAssociations.map(async (association) => {
    return getProject(association.project_id)
  })
  return Promise.all(projectPromises)
}

export async function createUserProject(userId: number, projectId: number, role: string): Promise<UserProject> {
  return makeAuthenticatedRequest('/user-projects/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, project_id: projectId, role }),
  })
}

// ---------- Project UML API ----------
export type ProjectUML = {
  id: number
  project_id: number | null
  type: string
  uml_schema: any
}

export async function getProjectUMLs(projectId: number): Promise<ProjectUML[]> {
  return makeAuthenticatedRequest(`/project-uml/project/${projectId}`)
}

// Persist/update UML schema for a project
export async function saveProjectUML(projectId: number, schema: any): Promise<ProjectUML> {
  return makeAuthenticatedRequest(`/project-uml/project/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(schema),
  })
}

// Update a specific UML record by its ID (matches backend: PUT /project-uml/{uml_id})
export type ProjectUMLUpdatePayload = {
  project_id?: number | null
  type: string
  uml_schema: any
}

export async function updateProjectUML(umlId: number, payload: ProjectUMLUpdatePayload): Promise<ProjectUML> {
  return makeAuthenticatedRequest(`/project-uml/${umlId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteProject(projectId: number): Promise<void> {
  const token = getAuthToken()
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const response = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }
  return
}

export async function deleteUserProject(userProjectId: number): Promise<void> {
  const token = getAuthToken()
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const response = await fetch(`${API_BASE}/user-projects/${userProjectId}`, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }
  return
}
