import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header'

export default function RootLayout() {
  const location = useLocation()
  const isLogin = location.pathname === '/'
  return (
    <div className="min-h-screen bg-[color:var(--color-secondary-50)]">
      {!isLogin && <Header />}
      <main className="py-6 grid place-items-center">
        <Outlet />
      </main>
    </div>
  )
}
