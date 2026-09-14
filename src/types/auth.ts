export type UserRole = 'owner' | 'partner'

export interface UserProfile {
  id: string
  email: string | null
  fullName: string | null
  role: UserRole
  isActive: boolean
  permissions: string[]
}

export interface AuthUser {
  id: string
  email: string | null
  profile: UserProfile | null
}

export interface AuthSession {
  token: string
  user: AuthUser
}
