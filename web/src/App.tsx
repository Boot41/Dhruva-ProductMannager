import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import RootLayout from './layout/RootLayout'
import Landing from './pages/Landing'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Login />} />
        <Route path="/landing" element={<Landing />} />
      </Route>
    </Routes>
  )
}
