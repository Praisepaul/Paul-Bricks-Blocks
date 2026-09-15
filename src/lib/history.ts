import { request } from './request'

export type HistoryType = 'sale' | 'purchase' | 'expense' | 'labour' | 'bill'
export interface HistoryItem { id: string; type: HistoryType; number: string; title: string; subtitle: string; amount: number; date: string; status?: 'paid' | 'unpaid'; createdAt: string }
export async function listHistory(): Promise<HistoryItem[]> { const result = await request<{ history: HistoryItem[] }>('/history'); return result.history }
