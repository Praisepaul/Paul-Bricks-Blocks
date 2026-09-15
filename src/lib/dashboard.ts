export interface DashboardTotals { today: string; sales: number; purchases: number; expenses: number; labour: number; unpaidBills: number; unpaidBillCount: number }

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export async function getDashboardTotals(): Promise<DashboardTotals> {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  const token = localStorage.getItem('pbb_auth_token')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_URL}/dashboard/today`, { headers })
  const body = (await response.json().catch(() => ({}))) as DashboardTotals & { message?: string }
  if (!response.ok) throw new Error(body.message ?? 'Unable to load dashboard totals')
  return body
}
