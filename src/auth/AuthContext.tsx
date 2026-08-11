import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { authService } from '@/services'
import type { Credentials, RegisterInput } from '@/services'
import type { User } from '@/services'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (creds: Credentials) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => void
  refresh: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Bridges the framework-agnostic authService to React. Components read auth
 * state via useAuth() and never touch localStorage or authService directly.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser())
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (creds: Credentials) => {
    setLoading(true)
    try {
      const u = await authService.login(creds)
      setUser(u)
      return u
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    setLoading(true)
    try {
      const u = await authService.register(input)
      setUser(u)
      return u
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const refresh = useCallback(() => setUser(authService.getCurrentUser()), [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
