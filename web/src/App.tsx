import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import RootLayout from './layout/RootLayout'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Login />} />
      </Route>
    </Routes>
  )
}
