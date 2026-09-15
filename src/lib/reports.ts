export interface ReportSummary {
  from: string
  to: string
  sales: { subtotal: number; gst: number; total: number; count: number }
  purchases: { total: number; count: number; inputGst: number; inputGstCaptured: boolean }
  expenses: { total: number; count: number }
  labour: { total: number; count: number }
  unpaidBills: { total: number; count: number }
  operatingOutflow: number
  cashMovementBeforeStockAndTax: number
  stockNote: string
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export async function getReportSummary(from: string, to: string): Promise<ReportSummary> {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  const token = localStorage.getItem('pbb_auth_token')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_URL}/reports/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { headers })
  const body = await response.json().catch(() => ({})) as ReportSummary & { message?: string }
  if (!response.ok) throw new Error(body.message ?? 'Unable to load report')
  return body
}
