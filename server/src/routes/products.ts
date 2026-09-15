import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { getDb } from '../db.js'
import { recordAuditEvent } from '../audit.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'

export interface ProductRecord {
  _id: ObjectId
  name: string
  unit: string
  sellingPrice: number
  purchasePrice: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export const productsRouter = Router()
productsRouter.use(requireAuth)

function sanitizeProduct(product: ProductRecord) {
  return { id: product._id.toHexString(), name: product.name, unit: product.unit, sellingPrice: product.sellingPrice, purchasePrice: product.purchasePrice, isActive: product.isActive, createdAt: product.createdAt, updatedAt: product.updatedAt }
}

function readProductInput(body: unknown) {
  const value = body as Record<string, unknown> | null
  const sellingPrice = typeof value?.sellingPrice === 'number' ? value.sellingPrice : Number(value?.sellingPrice)
  const purchasePrice = typeof value?.purchasePrice === 'number' ? value.purchasePrice : Number(value?.purchasePrice)
  return { name: typeof value?.name === 'string' ? value.name.trim() : '', unit: typeof value?.unit === 'string' ? value.unit.trim() : '', sellingPrice, purchasePrice }
}

function validPrice(value: number) { return Number.isFinite(value) && value >= 0 }

productsRouter.get('/', async (_req: AuthenticatedRequest, res) => {
  const products = await getDb().collection<ProductRecord>('products').find({}).sort({ isActive: -1, name: 1 }).toArray()
  return res.json({ products: products.map(sanitizeProduct) })
})

productsRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const input = readProductInput(req.body)
  if (!input.name) return res.status(400).json({ message: 'Product name is required' })
  if (!input.unit) return res.status(400).json({ message: 'Unit is required' })
  if (!validPrice(input.sellingPrice) || !validPrice(input.purchasePrice)) return res.status(400).json({ message: 'Prices must be valid non-negative numbers' })
  const now = new Date()
  const product: ProductRecord = { _id: new ObjectId(), ...input, isActive: true, createdAt: now, updatedAt: now }
  await getDb().collection<ProductRecord>('products').insertOne(product)
  await recordAuditEvent({ actorUserId: req.user!._id, actorRole: req.user!.role, action: 'create', entity: 'product', entityId: product._id.toHexString(), details: { name: product.name } })
  return res.status(201).json({ product: sanitizeProduct(product) })
})

productsRouter.put('/:id', async (req: AuthenticatedRequest, res) => {
  const idValue = String(req.params.id)
  if (!ObjectId.isValid(idValue)) return res.status(400).json({ message: 'Invalid product id' })
  const productId = new ObjectId(idValue)
  const existing = await getDb().collection<ProductRecord>('products').findOne({ _id: productId })
  if (!existing) return res.status(404).json({ message: 'Product not found' })
  const input = readProductInput(req.body)
  if (!input.name) return res.status(400).json({ message: 'Product name is required' })
  if (!input.unit) return res.status(400).json({ message: 'Unit is required' })
  if (!validPrice(input.sellingPrice) || !validPrice(input.purchasePrice)) return res.status(400).json({ message: 'Prices must be valid non-negative numbers' })
  const isActive = typeof req.body?.isActive === 'boolean' ? req.body.isActive : existing.isActive
  const updatedAt = new Date()
  await getDb().collection<ProductRecord>('products').updateOne({ _id: productId }, { $set: { ...input, isActive, updatedAt } })
  const product = { ...existing, ...input, isActive, updatedAt }
  await recordAuditEvent({ actorUserId: req.user!._id, actorRole: req.user!.role, action: 'update', entity: 'product', entityId: productId.toHexString(), details: { name: product.name, isActive } })
  return res.json({ product: sanitizeProduct(product) })
})
