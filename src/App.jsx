import { useEffect } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import GroupDetails from './pages/GroupDetails'
import CreateGroup from './pages/CreateGroup'
import Profile from './pages/Profile'

import AppNav from './components/layout/AppNav'
import OfflineBanner from './components/layout/OfflineBanner'
import Toaster from './components/ui/Toaster'
import ConfirmHost from './components/ui/ConfirmHost'

import { syncOfflineData } from './services/offlineSync'
import api from './services/api'
import { getUser } from './lib/session'

// The UI is gated on the stored user profile. The server enforces real auth via
// the httpOnly session cookie, and the axios interceptor redirects to /login on 401.
function PrivateRoute({ children }) {
  return getUser() ? children : <Navigate to="/login" replace />
}

function Shell() {
  const { pathname } = useLocation()
  const isAuthPage = pathname === '/login' || pathname === '/register'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      {!isAuthPage && <AppNav />}
      <Toaster />
      <ConfirmHost />

      <main className={isAuthPage ? 'flex-1' : 'mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-28 md:px-6 md:pt-10 md:pb-16'}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/create-group" element={<PrivateRoute><CreateGroup /></PrivateRoute>} />
          <Route path="/group/:groupId" element={<PrivateRoute><GroupDetails /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <OfflineBanner />
    </div>
  )
}

export default function App() {
  // Flush anything queued while offline, now and whenever the connection returns.
  useEffect(() => {
    const flush = () => syncOfflineData(api)
    window.addEventListener('online', flush)
    if (navigator.onLine) flush()
    return () => window.removeEventListener('online', flush)
  }, [])

  return (
    <Router>
      <Shell />
    </Router>
  )
}
