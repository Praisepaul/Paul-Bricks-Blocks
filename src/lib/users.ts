import type { UserProfile, UserRole } from '../types/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  const token = localStorage.getItem('pbb_auth_token')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const body = (await response.json().catch(() => ({}))) as { message?: string }
  if (!response.ok) throw new Error(body.message ?? 'Request failed')
  return body as T
}

export async function listUsers(): Promise<UserProfile[]> {
  const result = await request<{ users: UserProfile[] }>('/users')
  return result.users
}

export async function createUser(input: { fullName: string; email: string; password: string; role: UserRole }): Promise<UserProfile> {
  const result = await request<{ user: UserProfile }>('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return result.user
}
