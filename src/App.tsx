import { Navigate, Route, Routes } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { AppLayout } from '@/app/AppLayout'
import { Dashboard } from '@/pages/app/Dashboard'
import { LiveSession } from '@/pages/app/LiveSession'
import { Analytics } from '@/pages/app/Analytics'
import { Recovery } from '@/pages/app/Recovery'
import { Profile } from '@/pages/app/Profile'
import { Settings } from '@/pages/app/Settings'

export default function App() {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected app */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="session" element={<LiveSession />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="recovery" element={<Recovery />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Cinematic film-grain texture over the whole page (static). */}
      <div className="grain-overlay" aria-hidden />
    </>
  )
}
