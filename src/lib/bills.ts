import { getStoredToken } from './auth/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export interface Bill {
  id: string
  billNumber: string
  title: string
  category: string
  amount: number
  billDate: string
  dueDate: string
  isPaid: boolean
  paidDate: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

export interface BillInput {
  title: string
  category: string
  amount: number
  billDate: string
  dueDate: string
  notes: string
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken()
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options?.headers ?? {}) } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message ?? 'Request failed.')
  return data as T
}

export function listBills(): Promise<Bill[]> { return request<Bill[]>('/bills') }
export function createBill(input: BillInput): Promise<Bill> { return request<Bill>('/bills', { method: 'POST', body: JSON.stringify(input) }) }
export function markBillPaid(id: string, paidDate: string): Promise<Bill> { return request<Bill>(`/bills/${id}/pay`, { method: 'PUT', body: JSON.stringify({ paidDate }) }) }
