import { Outlet } from 'react-router-dom'
import './rootlayout.css'

export default function RootLayout() {
  return (
    <div className="app-shell">
      <Outlet />
    </div>
  )
}
