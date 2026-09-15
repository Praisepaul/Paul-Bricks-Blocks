import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { getDb } from '../db.js'
import { recordAuditEvent } from '../audit.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'
import { calculateStockValuation } from '../stockValuation.js'

export type StockMovementType = 'opening' | 'adjustment'
interface StockMovementRecord { _id: ObjectId; productId: ObjectId; productName: string; unit: string; type: StockMovementType; quantity: number; unitCost?: number; reason: string; createdByUserId: ObjectId; createdAt: Date }
export const stockRouter = Router(); stockRouter.use(requireAuth)
function round(value: number) { return Math.round(value * 100) / 100 }

stockRouter.get('/', async (_req: AuthenticatedRequest, res) => {
  const db = getDb(); const [products, purchases, sales, adjustments, valuation] = await Promise.all([
    db.collection('products').find({}).sort({ isActive: -1, name: 1 }).toArray(),
    db.collection('purchases').aggregate([{ $group: { _id: '$productId', quantity: { $sum: '$quantity' } } }]).toArray(),
    db.collection('sales').aggregate([{ $group: { _id: '$productId', quantity: { $sum: '$quantity' } } }]).toArray(),
    db.collection<StockMovementRecord>('stock_movements').aggregate([{ $group: { _id: '$productId', quantity: { $sum: '$quantity' } } }]).toArray(),
    calculateStockValuation(),
  ])
  const purchaseMap = new Map(purchases.map((item) => [String(item._id), Number(item.quantity ?? 0)])); const salesMap = new Map(sales.map((item) => [String(item._id), Number(item.quantity ?? 0)])); const adjustmentMap = new Map(adjustments.map((item) => [String(item._id), Number(item.quantity ?? 0)])); const valuationMap = new Map(valuation.items.map((item) => [item.productId, item]))
  const stock = products.map((product) => { const id = product._id.toHexString(); const value = valuationMap.get(id); return { id, name: String(product.name), unit: String(product.unit), isActive: Boolean(product.isActive), purchased: round(purchaseMap.get(id) ?? 0), sold: round(salesMap.get(id) ?? 0), adjusted: round(adjustmentMap.get(id) ?? 0), quantity: round((purchaseMap.get(id) ?? 0) - (salesMap.get(id) ?? 0) + (adjustmentMap.get(id) ?? 0)), stockValue: value?.stockValue ?? 0, averageCost: value?.averageCost ?? 0 } })
  return res.json({ stock, valuationIncomplete: valuation.incomplete })
})

stockRouter.post('/adjustments', async (req: AuthenticatedRequest, res) => {
  const body = req.body as Record<string, unknown> | null; const productId = typeof body?.productId === 'string' ? body.productId : ''; const type = body?.type === 'opening' ? 'opening' : body?.type === 'adjustment' ? 'adjustment' : ''; const quantity = typeof body?.quantity === 'number' ? body.quantity : Number(body?.quantity); const direction = body?.direction === 'remove' ? 'remove' : body?.direction === 'add' ? 'add' : ''; const reason = typeof body?.reason === 'string' ? body.reason.trim() : ''; const unitCost = typeof body?.unitCost === 'number' ? body.unitCost : Number(body?.unitCost)
  if (!ObjectId.isValid(productId)) return res.status(400).json({ message: 'Valid product is required' }); if (!type) return res.status(400).json({ message: 'Stock entry type is required' }); if (!Number.isFinite(quantity) || quantity <= 0) return res.status(400).json({ message: 'Quantity must be greater than zero' }); if (!direction) return res.status(400).json({ message: 'Choose add or remove stock' }); if (!reason) return res.status(400).json({ message: 'Reason is required' }); if (type === 'opening' && direction === 'remove') return res.status(400).json({ message: 'Opening stock can only add stock' }); if (direction === 'add' && (!Number.isFinite(unitCost) || unitCost < 0)) return res.status(400).json({ message: 'Cost per unit is required when adding stock' })
  const db = getDb(); const product = await db.collection('products').findOne({ _id: new ObjectId(productId) }); if (!product) return res.status(404).json({ message: 'Product not found' })
  const signedQuantity = round(direction === 'remove' ? -quantity : quantity); const movementId = new ObjectId(); const now = new Date(); const movement: StockMovementRecord = { _id: movementId, productId: product._id, productName: String(product.name), unit: String(product.unit), type, quantity: signedQuantity, ...(direction === 'add' ? { unitCost: round(unitCost) } : {}), reason, createdByUserId: req.user!._id, createdAt: now }
  await db.collection<StockMovementRecord>('stock_movements').insertOne(movement); await recordAuditEvent({ actorUserId: req.user!._id, actorRole: req.user!.role, action: 'create', entity: 'stock_movement', entityId: movementId.toHexString(), details: { productName: movement.productName, type, quantity: signedQuantity, unitCost: movement.unitCost, reason } })
  return res.status(201).json({ movement: { id: movementId.toHexString(), productId, productName: movement.productName, unit: movement.unit, type, quantity: signedQuantity, unitCost: movement.unitCost, reason, createdAt: now } })
})
