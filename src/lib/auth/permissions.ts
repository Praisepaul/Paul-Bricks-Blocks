import type { UserRole } from '../../types/auth'

export type Permission =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'manage_users'
  | 'manage_settings'

const rolePermissions: Record<UserRole, readonly Permission[]> = {
  owner: ['view', 'create', 'edit', 'delete', 'manage_users', 'manage_settings'],
  partner: ['view', 'create', 'edit'],
}

export function hasPermission(role: UserRole | null, permission: Permission): boolean {
  return role ? rolePermissions[role].includes(permission) : false
}

export function canDelete(role: UserRole | null): boolean {
  return hasPermission(role, 'delete')
}
