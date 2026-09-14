import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadAuthUser } from './auth'
import type { AuthUser } from '../../types/auth'

interface AuthContextValue {
  session: { user: { id: string } } | null
  user: AuthUser | null
  loading: boolean
  configured: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  async function refreshUser() { setUser(await loadAuthUser()) }
  useEffect(() => {
    const refresh = () => void refreshUser()
    void refreshUser().finally(() => setLoading(false))
    window.addEventListener('pbb-auth-changed', refresh)
    return () => window.removeEventListener('pbb-auth-changed', refresh)
  }, [])
  const value = useMemo(() => ({ session: user ? { user: { id: user.id } } : null, user, loading, configured: true, refreshUser }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used inside AuthProvider'); return context }
