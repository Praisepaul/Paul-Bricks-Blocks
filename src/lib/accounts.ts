export type AccountType = 'customer' | 'supplier'
export interface AccountEntry { id: string; date: string; type: 'sale' | 'receipt' | 'purchase' | 'payment'; number: string; description: string; debit: number; credit: number; balance: number }
export interface AccountStatement { account: { id?: string; name: string; phone?: string; type: AccountType }; statement: AccountEntry[]; outstanding: number }
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
async function request<T>(path: string): Promise<T> { const token = localStorage.getItem('pbb_auth_token'); const response = await fetch(`${API_URL}${path}`, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message ?? 'Request failed.'); return data as T }
export function getCustomerAccount(id: string): Promise<AccountStatement> { return request<AccountStatement>(`/accounts/customer/${encodeURIComponent(id)}`) }
export function getSupplierAccount(idOrName: string): Promise<AccountStatement> { const query = encodeURIComponent(idOrName); return request<AccountStatement>(`/accounts/supplier?${/^[a-f0-9]{24}$/i.test(idOrName) ? `id=${query}` : `name=${query}`) } }
