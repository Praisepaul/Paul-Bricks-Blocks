import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadAuthUser, signOut } from './auth'
import type { AuthUser } from '../../types/auth'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  configured: boolean
  refreshUser: () => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function refreshUser() {
    const authUser = await loadAuthUser()
    setUser(authUser)
  }

  async function signOutUser() {
    await signOut()
    setUser(null)
  }

  useEffect(() => {
    void refreshUser().finally(() => setLoading(false))
  }, [])

  const value = useMemo(
    () => ({ user, loading, configured: true, refreshUser, signOutUser }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
