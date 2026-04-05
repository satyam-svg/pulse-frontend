import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Upload and direct video create are limited to editor and admin roles. */
export function EditorRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user || (user.role !== 'editor' && user.role !== 'admin')) {
    return <Navigate to="/app" replace />
  }
  return <>{children}</>
}
