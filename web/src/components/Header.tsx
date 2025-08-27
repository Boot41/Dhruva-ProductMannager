import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Button from './Button'
import { getCurrentUser, type User, isAuthenticated, logout } from '../Api/auth'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        if (isAuthenticated()) {
          const me = await getCurrentUser()
          if (mounted) setUser(me)
        } else {
          if (mounted) setUser(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [location.pathname])

  const onSignOut = () => {
    logout()
    setUser(null)
    navigate('/', { replace: true })
  }

  return (
    <header className="w-full bg-white border-b border-[color:var(--color-secondary-200)]">
      <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={user ? '/landing' : '/'} className="font-extrabold text-xl text-[color:var(--color-secondary-900)] no-underline">
          LOGO
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to={user ? '/landing' : '/'}
            className="text-[color:var(--color-secondary-700)] hover:text-[color:var(--color-secondary-900)] no-underline"
          >
            Home
          </Link>
          <Link
            to="/projects"
            className="text-[color:var(--color-secondary-700)] hover:text-[color:var(--color-secondary-900)] no-underline"
          >
            Project
          </Link>
          <Link
            to="/tasks"
            className="text-[color:var(--color-secondary-700)] hover:text-[color:var(--color-secondary-900)] no-underline"
          >
            Tasks
          </Link>
          <Link
            to="/progress"
            className="text-[color:var(--color-secondary-700)] hover:text-[color:var(--color-secondary-900)] no-underline"
          >
            Progress
          </Link>
        </nav>
        <div>
          {loading ? null : user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="text-[color:var(--color-secondary-700)] hover:text-[color:var(--color-secondary-900)] no-underline"
              >
                {user.name}
              </Link>
              <Button variant="secondary" size="sm" onClick={onSignOut}>Sign out</Button>
            </div>
          ) : (
            <Link to="/">
              <Button>Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
