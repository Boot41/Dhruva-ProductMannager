import { getAuthToken } from './auth'

export type TaskAssignment = {
  id: number
  user_id: number
  project_id: number
  description?: string | null
  type?: string | null
  status?: 'todo' | 'in-progress' | 'blocked' | 'done' | null
  assigned_by?: number | null
  eta?: string | null
  created_at: string
}

export type TaskAssignmentCreate = {
  user_id: number
  project_id: number
  description?: string
  type?: string
  status?: 'todo' | 'in-progress' | 'blocked' | 'done'
  eta?: string
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
    throw new Error((errorData as any).detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function listMyTaskAssignments(): Promise<TaskAssignment[]> {
  return makeAuthenticatedRequest('/task-assignments/my')
}

export async function createTaskAssignment(payload: TaskAssignmentCreate): Promise<TaskAssignment> {
  return makeAuthenticatedRequest('/task-assignments/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateTaskAssignment(id: number, payload: Partial<TaskAssignmentCreate>): Promise<TaskAssignment> {
  return makeAuthenticatedRequest(`/task-assignments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
