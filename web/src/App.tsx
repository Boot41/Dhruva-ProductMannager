import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import RootLayout from './layout/RootLayout'
import Landing from './pages/Landing'
import Products from './pages/Products'
import AddProject from './pages/AddProject'
import Profile from './pages/Profile'
import ProjectOverview from './pages/ProjectOverview'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Login />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/projects" element={<Products />} />
        <Route path="/projects/:projectId/overview" element={<ProjectOverview />} />
        <Route path="/projects/add" element={<AddProject />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}
