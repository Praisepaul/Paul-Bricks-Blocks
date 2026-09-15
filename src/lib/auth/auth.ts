import { startAuthentication, startRegistration, type PublicKeyCredentialCreationOptionsJSON, type PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser'
import type { AuthSession, AuthUser, UserRole } from '../../types/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
const TOKEN_KEY = 'pbb_auth_token'
const AUTH_CHANGED_EVENT = 'pbb-auth-changed'

type ApiUser = {
  id: string
  email: string
  fullName: string
  role: UserRole
  isActive: boolean
  permissions: string[]
}

type ApiAuthResponse = {
  token: string
  user: ApiUser
}

function mapApiUser(user: ApiUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    profile: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions,
    },
  }
}

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
  const result = await request<ApiAuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  storeToken(result.token)
  notifyAuthChanged()
  return { token: result.token, user: mapApiUser(result.user) }
}

export async function signInWithPasskey(): Promise<AuthSession> {
  const options = await request<PublicKeyCredentialRequestOptionsJSON>('/auth/passkey/login/options')
  const response = await startAuthentication({ optionsJSON: options })
  const result = await request<ApiAuthResponse>('/auth/passkey/login/verify', {
    method: 'POST',
    body: JSON.stringify({ challenge: options.challenge, response }),
  })
  storeToken(result.token)
  notifyAuthChanged()
  return { token: result.token, user: mapApiUser(result.user) }
}

export async function registerPasskey(): Promise<string> {
  const options = await request<PublicKeyCredentialCreationOptionsJSON>('/auth/passkey/register/options')
  const response = await startRegistration({ optionsJSON: options })
  const result = await request<{ message: string }>('/auth/passkey/register/verify', {
    method: 'POST',
    body: JSON.stringify({ challenge: options.challenge, response }),
  })
  return result.message
}

export async function signOut() {
  clearStoredToken()
  notifyAuthChanged()
}

export async function loadAuthUser(): Promise<AuthUser | null> {
  if (!getStoredToken()) return null
  try {
    const result = await request<{ user: ApiUser }>('/auth/me')
    return mapApiUser(result.user)
  } catch {
    clearStoredToken()
    return null
  }
}
