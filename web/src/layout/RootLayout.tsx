import { Outlet } from 'react-router-dom'

export default function RootLayout() {
  return (
    <div className="min-h-screen grid place-items-center bg-[color:var(--color-secondary-50)]">
      <Outlet />
    </div>
  )
}
