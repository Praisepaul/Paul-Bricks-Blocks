import { ObjectId } from 'mongodb'
import { getDb } from './db.js'

export interface StockValuationItem { productId: string; quantity: number; stockValue: number; averageCost: number }
export interface StockValuationResult { items: StockValuationItem[]; cogsBySale: Map<string, number>; incomplete: boolean }
function round(value: number) { return Math.round(value * 100) / 100 }

export async function calculateStockValuation(): Promise<StockValuationResult> {
  const db = getDb()
  const [products, purchases, sales, movements] = await Promise.all([
    db.collection('products').find({}).toArray(),
    db.collection('purchases').find({}).sort({ createdAt: 1, _id: 1 }).toArray(),
    db.collection('sales').find({}).sort({ createdAt: 1, _id: 1 }).toArray(),
    db.collection('stock_movements').find({}).sort({ createdAt: 1, _id: 1 }).toArray(),
  ])
  const states = new Map<string, { quantity: number; value: number }>()
  const productCosts = new Map<string, number>()
  for (const product of products) { states.set(product._id.toHexString(), { quantity: 0, value: 0 }); productCosts.set(product._id.toHexString(), Number(product.purchasePrice ?? 0)) }
  const events = [
    ...purchases.map((item) => ({ date: new Date(item.createdAt), id: item._id.toHexString(), kind: 'purchase' as const, item })),
    ...sales.map((item) => ({ date: new Date(item.createdAt), id: item._id.toHexString(), kind: 'sale' as const, item })),
    ...movements.map((item) => ({ date: new Date(item.createdAt), id: item._id.toHexString(), kind: 'movement' as const, item })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime() || a.id.localeCompare(b.id))
  const cogsBySale = new Map<string, number>(); let incomplete = false
  for (const event of events) {
    const productId = event.item.productId instanceof ObjectId ? event.item.productId.toHexString() : String(event.item.productId)
    const state = states.get(productId); if (!state) continue
    if (event.kind === 'purchase') { const quantity = Number(event.item.quantity ?? 0); const subtotal = Number(event.item.subtotal ?? Number(event.item.quantity ?? 0) * Number(event.item.unitPrice ?? 0)); state.quantity += quantity; state.value += subtotal; continue }
    if (event.kind === 'movement') {
      const quantity = Number(event.item.quantity ?? 0); const unitCost = Number(event.item.unitCost ?? productCosts.get(productId) ?? 0)
      if (event.item.unitCost === undefined && quantity > 0) incomplete = true
      if (quantity >= 0) { state.quantity += quantity; state.value += quantity * unitCost }
      else { const removeQuantity = Math.min(Math.abs(quantity), Math.max(state.quantity, 0)); const averageCost = state.quantity > 0 ? state.value / state.quantity : unitCost; state.quantity -= Math.abs(quantity); state.value -= removeQuantity * averageCost; if (state.quantity < 0) { incomplete = true; state.value = 0 } }
      state.value = Math.max(0, state.value); continue
    }
    const quantity = Number(event.item.quantity ?? 0); const averageCost = state.quantity > 0 ? state.value / state.quantity : 0; const cogs = round(quantity * averageCost)
    cogsBySale.set(event.id, cogs); state.quantity -= quantity; state.value -= cogs
    if (state.quantity < -0.000001) { incomplete = true; state.quantity = 0; state.value = 0 }
    state.value = Math.max(0, state.value)
  }
  const items = [...states.entries()].map(([productId, state]) => ({ productId, quantity: round(Math.max(0, state.quantity)), stockValue: round(Math.max(0, state.value)), averageCost: state.quantity > 0 ? round(state.value / state.quantity) : 0 }))
  return { items, cogsBySale, incomplete }
}
