import { ObjectId } from 'mongodb'
import { getDb } from './db.js'
import { calculateStockValuation } from './stockValuation.js'

export type LedgerType = 'sale' | 'purchase' | 'expense' | 'labour' | 'stock'
export interface LedgerEntry {
  id: string
  date: Date
  type: LedgerType
  number: string
  description: string
  debitAccount: string
  creditAccount: string
  amount: number
}

function round(value: number) { return Math.round(value * 100) / 100 }

export async function buildLedger(from?: Date, to?: Date): Promise<LedgerEntry[]> {
  const db = getDb()
  const filter: Record<string, unknown> = {}
  if (from || to) filter.createdAt = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) }

  const [sales, purchases, expenses, labour] = await Promise.all([
    db.collection('sales').find(filter).sort({ createdAt: 1, _id: 1 }).toArray(),
    db.collection('purchases').find(filter).sort({ createdAt: 1, _id: 1 }).toArray(),
    db.collection('expenses').find(filter).sort({ createdAt: 1, _id: 1 }).toArray(),
    db.collection('labour').find(filter).sort({ createdAt: 1, _id: 1 }).toArray(),
  ])

  const valuation = await calculateStockValuation(to)
  const entries: LedgerEntry[] = []

  for (const sale of sales) {
    const subtotal = round(Number(sale.subtotal ?? sale.totalAmount ?? 0))
    const tax = round(Number(sale.taxAmount ?? 0))
    const total = round(subtotal + tax)
    const saleId = sale._id instanceof ObjectId ? sale._id.toHexString() : String(sale._id)
    entries.push({ id: `${saleId}-sale`, date: new Date(sale.createdAt), type: 'sale', number: String(sale.invoiceNumber), description: `${String(sale.productName)} · ${Number(sale.quantity)} ${String(sale.unit)}`, debitAccount: 'Sales Receivable', creditAccount: 'Sales', amount: subtotal })
    if (tax > 0) entries.push({ id: `${saleId}-gst`, date: new Date(sale.createdAt), type: 'sale', number: String(sale.invoiceNumber), description: 'GST on sale', debitAccount: 'Sales Receivable', creditAccount: 'Output GST', amount: tax })
    const cogs = round(valuation.cogsBySale.get(saleId) ?? 0)
    if (cogs > 0) entries.push({ id: `${saleId}-cogs`, date: new Date(sale.createdAt), type: 'sale', number: String(sale.invoiceNumber), description: 'Cost of goods sold', debitAccount: 'COGS', creditAccount: 'Inventory', amount: cogs })
    if (total <= 0) continue
  }

  for (const purchase of purchases) {
    const subtotal = round(Number(purchase.subtotal ?? 0))
    const tax = round(Number(purchase.taxAmount ?? 0))
    const id = purchase._id instanceof ObjectId ? purchase._id.toHexString() : String(purchase._id)
    if (subtotal > 0) entries.push({ id: `${id}-inventory`, date: new Date(purchase.createdAt), type: 'purchase', number: String(purchase.purchaseNumber), description: `${String(purchase.productName)} · ${Number(purchase.quantity)} ${String(purchase.unit)}`, debitAccount: 'Inventory', creditAccount: 'Purchase Payable', amount: subtotal })
    if (tax > 0) entries.push({ id: `${id}-gst`, date: new Date(purchase.createdAt), type: 'purchase', number: String(purchase.purchaseNumber), description: 'GST on purchase', debitAccount: 'Input GST', creditAccount: 'Purchase Payable', amount: tax })
  }

  for (const expense of expenses) {
    const amount = round(Number(expense.amount ?? 0))
    if (amount <= 0) continue
    const id = expense._id instanceof ObjectId ? expense._id.toHexString() : String(expense._id)
    entries.push({ id, date: new Date(`${String(expense.expenseDate)}T00:00:00`), type: 'expense', number: String(expense.expenseNumber), description: String(expense.description || expense.category), debitAccount: String(expense.category), creditAccount: 'Cash / Bank', amount })
  }

  for (const item of labour) {
    const amount = round(Number(item.amount ?? 0))
    if (amount <= 0) continue
    const id = item._id instanceof ObjectId ? item._id.toHexString() : String(item._id)
    entries.push({ id, date: new Date(`${String(item.labourDate)}T00:00:00`), type: 'labour', number: String(item.labourNumber), description: String(item.workDescription || item.workerName), debitAccount: 'Labour Expense', creditAccount: 'Cash / Bank', amount })
  }

  return entries.sort((a, b) => a.date.getTime() - b.date.getTime() || a.id.localeCompare(b.id))
}
