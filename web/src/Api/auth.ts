export type LoginPayload = { email: string; password: string }

// Replace with real API call to your backend
export async function login(_payload: LoginPayload): Promise<void> {
  // Example placeholder. Integrate with your server when ready.
  // const res = await fetch('/api/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // })
  // if (!res.ok) {
  //   const data = await res.json().catch(() => ({}))
  //   throw new Error(data?.message || 'Login failed')
  // }
  await new Promise((r) => setTimeout(r, 600))
}
