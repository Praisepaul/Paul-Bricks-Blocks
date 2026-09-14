import type { Session } from '@supabase/supabase-js'
import { supabase } from '../supabase/client'
import type { AuthUser, UserProfile } from '../../types/auth'

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function loadAuthUser(): Promise<AuthUser | null> {
  if (!supabase) return null
  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData.session?.user
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: user.email ?? null,
    profile: profile
      ? ({
          id: profile.id,
          fullName: profile.full_name,
          role: profile.role as UserProfile['role'],
          isActive: profile.is_active,
        } satisfies UserProfile)
      : null,
  }
}
