export type HistoryType = 'sale' | 'purchase' | 'expense' | 'labour' | 'bill'
export interface HistoryItem { id: string; type: HistoryType; number: string; title: string; subtitle: string; amount: number; date: string; status?: 'paid' | 'unpaid'; createdAt: string }

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

async function request<T>(path: string): Promise<T> {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  const token = localStorage.getItem('pbb_auth_token')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_URL}${path}`, { headers })
  const body = (await response.json().catch(() => ({}))) as { message?: string }
  if (!response.ok) throw new Error(body.message ?? 'Request failed')
  return body as T
}

export async function listHistory(): Promise<HistoryItem[]> { const result = await request<{ history: HistoryItem[] }>('/history'); return result.history }
