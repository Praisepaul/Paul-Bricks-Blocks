import type { AuthSession, AuthUser } from '../../types/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
const TOKEN_KEY = 'pbb_auth_token'
const AUTH_CHANGED_EVENT = 'pbb-auth-changed'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  const token = getStoredToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const body = (await response.json().catch(() => ({}))) as { message?: string }
  if (!response.ok) throw new Error(body.message ?? 'Request failed')
  return body as T
}

export async function signIn(email: string, password: string): Promise<AuthSession> {
  const result = await request<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  storeToken(result.token)
  notifyAuthChanged()
  return result
}

export async function signOut() {
  clearStoredToken()
  notifyAuthChanged()
}

export async function loadAuthUser(): Promise<AuthUser | null> {
  if (!getStoredToken()) return null
  try {
    const result = await request<{ user: AuthUser }>('/auth/me')
    return result.user
  } catch {
    clearStoredToken()
    return null
  }
}
