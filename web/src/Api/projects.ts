import { getAuthToken } from './auth'

export type Project = {
  id: number
  name: string
  description: string
  owner_id: number
  status: string
  created_at: string
}

export type ProjectCreate = {
  name: string
  description: string
  status: string
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

export async function getAllProjects(): Promise<Project[]> {
  return makeAuthenticatedRequest('/projects/all/public')
}
