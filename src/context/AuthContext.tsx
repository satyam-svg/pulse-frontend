import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  apiJson,
  getToken,
  setAuthFailureHandler,
  setToken,
  type ApiUserJson,
} from '../lib/api'
import type { User, UserRole } from '../types'
import { useToast } from './ToastContext'

function mapApiUser(u: ApiUserJson): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  }
}

interface AuthContextValue {
  user: User | null
  /** false until we know whether a stored token is valid */
  authReady: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (payload: { name: string; email: string; password: string; role: UserRole }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    setAuthFailureHandler(() => {
      showToast({ variant: 'info', message: 'Your session expired. Please sign in again.' })
      setToken(null)
      setUser(null)
    })
    return () => setAuthFailureHandler(null)
  }, [showToast])

  useEffect(() => {
    let cancelled = false
    const token = getToken()
    if (!token) {
      setAuthReady(true)
      return () => {
        cancelled = true
      }
    }
    ;(async () => {
      try {
        const me = await apiJson<ApiUserJson>('/api/users/me', { auth: 'required' })
        if (!cancelled) setUser(mapApiUser(me))
      } catch {
        if (!cancelled) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setAuthReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiJson<{ user: ApiUserJson; token: string }>('/api/auth/login', {
      method: 'POST',
      auth: 'none',
      body: JSON.stringify({ email, password }),
    })
    setToken(data.token)
    setUser(mapApiUser(data.user))
  }, [])

  const signup = useCallback(
    async (payload: { name: string; email: string; password: string; role: UserRole }) => {
      const data = await apiJson<{ user: ApiUserJson; token: string }>('/api/auth/register', {
        method: 'POST',
        auth: 'none',
        body: JSON.stringify(payload),
      })
      setToken(data.token)
      setUser(mapApiUser(data.user))
    },
    [],
  )

  const value = useMemo(
    () => ({ user, authReady, login, signup, logout }),
    [user, authReady, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- useAuth is part of the auth API surface
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
