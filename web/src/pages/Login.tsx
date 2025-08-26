import { useState } from 'react'
import { login } from '../Api/auth'
import FormInput from '../components/FormInput'
import Button from '../components/Button'
import './login.css'

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
    <div className="login-container">
      <div className="login-card">
        <h1 className="title">Welcome</h1>
        <p className="subtitle">Sign in to continue</p>
        <form onSubmit={onSubmit} className="form">
          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={(v: string) => setEmail(v)}
            placeholder="you@example.com"
            required
          />
          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={(v: string) => setPassword(v)}
            placeholder="••••••••"
            required
          />
          {error && <div className="error">{error}</div>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
