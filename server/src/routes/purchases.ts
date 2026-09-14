import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { getDb } from '../db.js'
import { recordAuditEvent } from '../audit.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'

export interface PurchaseRecord {
  _id: ObjectId
  purchaseNumber: string
  supplierName: string
  productId: ObjectId
  productName: string
  unit: string
  quantity: number
  unitPrice: number
  totalAmount: number
  createdByUserId: ObjectId
  createdAt: Date
}

export const purchasesRouter = Router()
purchasesRouter.use(requireAuth)

function sanitizePurchase(purchase: PurchaseRecord) {
  return {
    id: purchase._id.toHexString(),
    purchaseNumber: purchase.purchaseNumber,
    supplierName: purchase.supplierName,
    productId: purchase.productId.toHexString(),
    productName: purchase.productName,
    unit: purchase.unit,
    quantity: purchase.quantity,
    unitPrice: purchase.unitPrice,
    totalAmount: purchase.totalAmount,
    createdAt: purchase.createdAt,
  }
}

purchasesRouter.get('/', async (_req: AuthenticatedRequest, res) => {
  const purchases = await getDb().collection<PurchaseRecord>('purchases').find({}).sort({ createdAt: -1 }).limit(100).toArray()
  return res.json({ purchases: purchases.map(sanitizePurchase) })
})

purchasesRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const body = req.body as Record<string, unknown> | null
  const supplierName = typeof body?.supplierName === 'string' ? body.supplierName.trim() : ''
  const productId = typeof body?.productId === 'string' ? body.productId : ''
  const quantity = typeof body?.quantity === 'number' ? body.quantity : Number(body?.quantity)
  const unitPrice = typeof body?.unitPrice === 'number' ? body.unitPrice : Number(body?.unitPrice)

  if (!supplierName) return res.status(400).json({ message: 'Supplier name is required' })
  if (!ObjectId.isValid(productId)) return res.status(400).json({ message: 'Valid product is required' })
  if (!Number.isFinite(quantity) || quantity <= 0) return res.status(400).json({ message: 'Quantity must be greater than zero' })
  if (!Number.isFinite(unitPrice) || unitPrice < 0) return res.status(400).json({ message: 'Purchase price must be a valid non-negative number' })

  const db = getDb()
  const product = await db.collection('products').findOne({ _id: new ObjectId(productId), isActive: true })
  if (!product) return res.status(400).json({ message: 'Product is not active or does not exist' })

  const purchaseId = new ObjectId()
  const now = new Date()
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
  const purchaseNumber = `PUR-${datePart}-${purchaseId.toHexString().slice(-6).toUpperCase()}`
  const totalAmount = Math.round(quantity * unitPrice * 100) / 100
  const purchase: PurchaseRecord = {
    _id: purchaseId,
    purchaseNumber,
    supplierName,
    productId: product._id,
    productName: String(product.name),
    unit: String(product.unit),
    quantity,
    unitPrice,
    totalAmount,
    createdByUserId: req.user!._id,
    createdAt: now,
  }

  await db.collection<PurchaseRecord>('purchases').insertOne(purchase)
  await recordAuditEvent({
    actorUserId: req.user!._id,
    actorRole: req.user!.role,
    action: 'create',
    entity: 'purchase',
    entityId: purchaseId.toHexString(),
    details: { purchaseNumber, supplierName, productName: purchase.productName, quantity, totalAmount },
  })

  return res.status(201).json({ purchase: sanitizePurchase(purchase) })
})
