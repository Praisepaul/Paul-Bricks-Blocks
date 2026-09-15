export type PaymentKind = 'customer_receipt' | 'supplier_payment'
export interface Payment { id: string; kind: PaymentKind; customerId?: string; customerName: string; supplierName: string; amount: number; paymentDate: string; method: string; reference: string; notes: string; createdAt: string }
export interface CustomerOutstanding { id: string; name: string; billed: number; received: number; outstanding: number }
export interface SupplierOutstanding { name: string; billed: number; paid: number; outstanding: number }
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
async function request<T>(path: string, options: RequestInit = {}): Promise<T> { const token = localStorage.getItem('pbb_auth_token'); const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers ?? {}) } }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message ?? 'Request failed.'); return data as T }
export function listPayments(): Promise<Payment[]> { return request<Payment[]>('/payments') }
export function getOutstanding(): Promise<{ customers: CustomerOutstanding[]; suppliers: SupplierOutstanding[] }> { return request('/payments/outstanding') }
export function createPayment(input: { kind: PaymentKind; customerId?: string; supplierName?: string; amount: number; paymentDate: string; method: string; reference: string; notes: string }): Promise<Payment> { return request<Payment>('/payments', { method: 'POST', body: JSON.stringify(input) }) }
