export interface Labour {
  id: string
  labourNumber: string
  workerName: string
  workDescription: string
  amount: number
  labourDate: string
  createdAt: string
}

export interface LabourInput {
  workerName: string
  workDescription: string
  amount: number
  labourDate: string
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

export async function listLabour(): Promise<Labour[]> {
  const result = await request<{ labour: Labour[] }>('/labour')
  return result.labour
}

export async function createLabour(input: LabourInput): Promise<Labour> {
  const result = await request<{ labour: Labour }>('/labour', { method: 'POST', body: JSON.stringify(input) })
  return result.labour
}
