export interface Expense {
  id: string
  expenseNumber: string
  category: string
  description: string
  amount: number
  expenseDate: string
  createdAt: string
}

export interface ExpenseInput {
  category: string
  description: string
  amount: number
  expenseDate: string
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

export async function listExpenses(): Promise<Expense[]> {
  const result = await request<{ expenses: Expense[] }>('/expenses')
  return result.expenses
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const result = await request<{ expense: Expense }>('/expenses', { method: 'POST', body: JSON.stringify(input) })
  return result.expense
}
