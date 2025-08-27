import { getAuthToken } from './auth'

export type SystemDesignRequest = {
  features: string
  expected_users: string
  geography: string
  tech_stack?: string | null
  constraints?: string | null
  temperature?: number
  project_id?: number | null
}

export type ProjectUML = {
  id: number
  project_id: number | null
  type: string
  uml_schema: any
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

export async function createSystemDesign(payload: SystemDesignRequest): Promise<ProjectUML> {
  return makeAuthenticatedRequest('/system-design', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
