export interface Product { id: string; name: string; unit: string; sellingPrice: number; purchasePrice: number; isActive: boolean; createdAt: string; updatedAt: string }

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers); headers.set('Content-Type', 'application/json')
  const token = localStorage.getItem('pbb_auth_token'); if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const body = await response.json().catch(() => ({})) as { message?: string }
  if (!response.ok) throw new Error(body.message ?? 'Request failed')
  return body as T
}
export async function listProducts(): Promise<Product[]> { const result = await request<{ products: Product[] }>('/products'); return result.products }
export async function createProduct(input: { name: string; unit: string; sellingPrice: number; purchasePrice: number }): Promise<Product> { const result = await request<{ product: Product }>('/products', { method: 'POST', body: JSON.stringify(input) }); return result.product }
export async function updateProduct(id: string, input: { name: string; unit: string; sellingPrice: number; purchasePrice: number; isActive?: boolean }): Promise<Product> { const result = await request<{ product: Product }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(input) }); return result.product }
