import { Router } from 'express'
import { getDb } from '../db.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'

export interface HistoryItem {
  id: string
  type: 'sale' | 'purchase' | 'expense' | 'labour' | 'bill'
  number: string
  title: string
  subtitle: string
  amount: number
  date: string
  status?: 'paid' | 'unpaid'
  createdAt: Date
}

export const historyRouter = Router()
historyRouter.use(requireAuth)

historyRouter.get('/', async (_req: AuthenticatedRequest, res) => {
  const db = getDb()
  const [sales, purchases, expenses, labour, bills] = await Promise.all([
    db.collection('sales').find({}).sort({ createdAt: -1 }).limit(100).toArray(),
    db.collection('purchases').find({}).sort({ createdAt: -1 }).limit(100).toArray(),
    db.collection('expenses').find({}).sort({ expenseDate: -1, createdAt: -1 }).limit(100).toArray(),
    db.collection('labour').find({}).sort({ labourDate: -1, createdAt: -1 }).limit(100).toArray(),
    db.collection('bills').find({}).sort({ billDate: -1, createdAt: -1 }).limit(100).toArray(),
  ])
  const dateOf = (value: unknown) => new Date(value as string | Date).toISOString().slice(0, 10)
  const items: HistoryItem[] = [
    ...sales.map((item) => ({ id: String(item._id), type: 'sale' as const, number: String(item.invoiceNumber), title: `Sale to ${item.customerName}`, subtitle: `${item.productName} · ${item.quantity} ${item.unit}`, amount: Number(item.totalAmount), date: dateOf(item.createdAt), createdAt: new Date(item.createdAt) })),
    ...purchases.map((item) => ({ id: String(item._id), type: 'purchase' as const, number: String(item.purchaseNumber), title: `Purchase from ${item.supplierName}`, subtitle: `${item.productName} · ${item.quantity} ${item.unit}`, amount: Number(item.totalAmount), date: dateOf(item.createdAt), createdAt: new Date(item.createdAt) })),
    ...expenses.map((item) => ({ id: String(item._id), type: 'expense' as const, number: String(item.expenseNumber), title: String(item.category), subtitle: String(item.description || 'Business expense'), amount: Number(item.amount), date: String(item.expenseDate), createdAt: new Date(item.createdAt) })),
    ...labour.map((item) => ({ id: String(item._id), type: 'labour' as const, number: String(item.labourNumber), title: String(item.workerName), subtitle: String(item.workDescription || 'Labour payment'), amount: Number(item.amount), date: String(item.labourDate), createdAt: new Date(item.createdAt) })),
    ...bills.map((item) => ({ id: String(item._id), type: 'bill' as const, number: String(item.billNumber), title: String(item.billName), subtitle: String(item.category), amount: Number(item.amount), date: String(item.billDate), status: item.isPaid ? 'paid' as const : 'unpaid' as const, createdAt: new Date(item.createdAt) })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 200)
  return res.json({ history: items })
})
