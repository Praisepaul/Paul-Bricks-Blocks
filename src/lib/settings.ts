export interface BusinessSettings {
  businessName: string
  phone: string
  address: string
  state: string
  gstNumber: string
  defaultGstRate: number
  currency: string
}

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

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const result = await request<{ settings: BusinessSettings }>('/settings')
  return result.settings
}

export async function saveBusinessSettings(settings: BusinessSettings): Promise<BusinessSettings> {
  const result = await request<{ settings: BusinessSettings }>('/settings', { method: 'PUT', body: JSON.stringify(settings) })
  return result.settings
}
