import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AuthLoading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-[#f9f9f9] text-slate-600">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-red-600" aria-hidden />
      <p className="text-sm font-medium">Checking session…</p>
    </div>
  )
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, authReady } = useAuth()
  const location = useLocation()

  if (!authReady) {
    return <AuthLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
