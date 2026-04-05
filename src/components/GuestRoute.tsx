import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AuthLoading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-[var(--color-surface)] text-slate-600">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" aria-hidden />
      <p className="text-sm font-medium">Loading…</p>
    </div>
  )
}

/** Logged-in users are redirected away from login/signup (middleware-style gate). */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, authReady } = useAuth()

  if (!authReady) {
    return <AuthLoading />
  }

  if (user) {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}
