export type LoginPayload = { email: string; password: string }
export type LoginResponse = { access_token: string }
export type User = {
  id: number
  email: string
  name: string
  username: string
  role?: string | null
  company?: string | null
  skills?: Record<string, any> | null
}

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000'

export function getAuthToken(): string | null {
  return localStorage.getItem('access_token')
}

export function setAuthToken(token: string) {
  localStorage.setItem('access_token', token)
}

export function clearAuthToken() {
  localStorage.removeItem('access_token')
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = (await res.json().catch(() => ({}))) as Partial<LoginResponse & { detail?: string }>

  if (!res.ok) {
    const msg = (data && (data as any).detail) || 'Login failed'
    throw new Error(msg)
  }

  if (!data || !data.access_token) {
    throw new Error('Invalid response from server')
  }

  setAuthToken(data.access_token)
  return { access_token: data.access_token }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getAuthToken()
  if (!token) return null
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) {
    // token invalid/expired
    clearAuthToken()
    return null
  }
  if (!res.ok) {
    throw new Error('Failed to fetch current user')
  }
  const data = (await res.json()) as User
  return data
}

export function logout() {
  clearAuthToken()
}
