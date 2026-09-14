export type UserRole = 'owner' | 'partner'

export interface UserProfile {
  id: string
  fullName: string | null
  role: UserRole
  isActive: boolean
}

export interface AuthUser {
  id: string
  email: string | null
  profile: UserProfile | null
}
