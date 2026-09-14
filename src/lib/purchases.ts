export interface Purchase {
  id: string
  purchaseNumber: string
  supplierName: string
  productId: string
  productName: string
  unit: string
  quantity: number
  unitPrice: number
  totalAmount: number
  createdAt: string
}

export interface PurchaseInput {
  supplierName: string
  productId: string
  quantity: number
  unitPrice: number
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

export async function listPurchases(): Promise<Purchase[]> {
  const result = await request<{ purchases: Purchase[] }>('/purchases')
  return result.purchases
}

export async function createPurchase(input: PurchaseInput): Promise<Purchase> {
  const result = await request<{ purchase: Purchase }>('/purchases', { method: 'POST', body: JSON.stringify(input) })
  return result.purchase
}
