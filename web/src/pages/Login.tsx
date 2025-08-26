import { useState } from 'react'
import { login } from '../Api/auth'
import FormInput from '../components/FormInput'
import Button from '../components/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
      // TODO: navigate to dashboard/home once available
      alert('Logged in (mock). Wire this to your backend and navigate as needed.')
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full p-4">
      <div className="max-w-[500px] mx-auto bg-white border rounded-xl p-8 shadow-[0_10px_20px_rgba(0,0,0,0.04)] border-[color:var(--color-secondary-200)]">
        <h1 className="text-2xl font-extrabold text-[color:var(--color-secondary-900)] m-0">Welcome</h1>
        <p className="text-[color:var(--color-secondary-600)] mt-1 mb-6">Sign in to continue</p>
        <form onSubmit={onSubmit} className="grid gap-4">
          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={(v: string) => setEmail(v)}
            required
          />
          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={(v: string) => setPassword(v)}
            required
          />
          {error && (
            <div className="alert text-red-700 border-red-300 bg-red-100">
              {error}
            </div>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
