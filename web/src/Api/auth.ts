export type LoginPayload = { email: string; password: string }
export type LoginResponse = { access_token: string }

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000'

export function getAuthToken(): string | null {
  return localStorage.getItem('access_token')
}

export function setAuthToken(token: string) {
  localStorage.setItem('access_token', token)
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
