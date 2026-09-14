import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { getDb } from '../db.js'
import { recordAuditEvent } from '../audit.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'

export interface SaleRecord {
  _id: ObjectId
  invoiceNumber: string
  customerId: ObjectId
  customerName: string
  productId: ObjectId
  productName: string
  unit: string
  quantity: number
  unitPrice: number
  totalAmount: number
  createdByUserId: ObjectId
  createdAt: Date
}

export const salesRouter = Router()
salesRouter.use(requireAuth)

function sanitizeSale(sale: SaleRecord) {
  return {
    id: sale._id.toHexString(),
    invoiceNumber: sale.invoiceNumber,
    customerId: sale.customerId.toHexString(),
    customerName: sale.customerName,
    productId: sale.productId.toHexString(),
    productName: sale.productName,
    unit: sale.unit,
    quantity: sale.quantity,
    unitPrice: sale.unitPrice,
    totalAmount: sale.totalAmount,
    createdAt: sale.createdAt,
  }
}

salesRouter.get('/', async (_req: AuthenticatedRequest, res) => {
  const sales = await getDb().collection<SaleRecord>('sales').find({}).sort({ createdAt: -1 }).limit(100).toArray()
  return res.json({ sales: sales.map(sanitizeSale) })
})

salesRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const body = req.body as Record<string, unknown> | null
  const customerId = typeof body?.customerId === 'string' ? body.customerId : ''
  const productId = typeof body?.productId === 'string' ? body.productId : ''
  const quantity = typeof body?.quantity === 'number' ? body.quantity : Number(body?.quantity)
  const unitPrice = typeof body?.unitPrice === 'number' ? body.unitPrice : Number(body?.unitPrice)

  if (!ObjectId.isValid(customerId)) return res.status(400).json({ message: 'Valid customer is required' })
  if (!ObjectId.isValid(productId)) return res.status(400).json({ message: 'Valid product is required' })
  if (!Number.isFinite(quantity) || quantity <= 0) return res.status(400).json({ message: 'Quantity must be greater than zero' })
  if (!Number.isFinite(unitPrice) || unitPrice < 0) return res.status(400).json({ message: 'Price must be a valid non-negative number' })

  const db = getDb()
  const customer = await db.collection('customers').findOne({ _id: new ObjectId(customerId), isActive: true })
  if (!customer) return res.status(400).json({ message: 'Customer is not active or does not exist' })
  const product = await db.collection('products').findOne({ _id: new ObjectId(productId), isActive: true })
  if (!product) return res.status(400).json({ message: 'Product is not active or does not exist' })

  const saleId = new ObjectId()
  const now = new Date()
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
  const invoiceNumber = `INV-${datePart}-${saleId.toHexString().slice(-6).toUpperCase()}`
  const totalAmount = Math.round(quantity * unitPrice * 100) / 100
  const sale: SaleRecord = {
    _id: saleId,
    invoiceNumber,
    customerId: customer._id,
    customerName: String(customer.name),
    productId: product._id,
    productName: String(product.name),
    unit: String(product.unit),
    quantity,
    unitPrice,
    totalAmount,
    createdByUserId: req.user!._id,
    createdAt: now,
  }

  await db.collection<SaleRecord>('sales').insertOne(sale)
  await recordAuditEvent({
    actorUserId: req.user!._id,
    actorRole: req.user!.role,
    action: 'create',
    entity: 'sale',
    entityId: saleId.toHexString(),
    details: { invoiceNumber, customerName: sale.customerName, productName: sale.productName, quantity, totalAmount },
  })

  return res.status(201).json({ sale: sanitizeSale(sale) })
})
