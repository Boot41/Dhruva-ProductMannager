import { getAuthToken } from './auth'
import type { User } from './auth'

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

export async function updateUserSkills(skills: Record<string, any>): Promise<User> {
  return makeAuthenticatedRequest('/auth/me/skills', {
    method: 'PUT',
    body: JSON.stringify(skills),
  })
}

export async function getUserProfile(): Promise<User> {
  return makeAuthenticatedRequest('/auth/me')
}

export async function searchEmployees(companyName: string, query: string): Promise<User[]> {
  console.log('Searching employees with query:', query, 'in company:', companyName)
  return makeAuthenticatedRequest(`/company/${companyName}/employees/search?q=${query}`)
}
