import { Router } from 'express'
import { getDb } from '../db.js'
import { recordAuditEvent } from '../audit.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'

export interface BusinessSettings {
  _id: 'business'
  businessName: string
  phone: string
  address: string
  state: string
  gstNumber: string
  defaultGstRate: number
  currency: string
  updatedAt: Date
}

export const settingsRouter = Router()
settingsRouter.use(requireAuth)

const defaults: Omit<BusinessSettings, '_id' | 'updatedAt'> = {
  businessName: 'Paul Bricks & Blocks', phone: '', address: '', state: '', gstNumber: '', defaultGstRate: 0, currency: 'INR',
}

function sanitizeSettings(settings: BusinessSettings) {
  return { businessName: settings.businessName, phone: settings.phone, address: settings.address, state: settings.state, gstNumber: settings.gstNumber, defaultGstRate: settings.defaultGstRate, currency: settings.currency }
}

settingsRouter.get('/', async (_req: AuthenticatedRequest, res) => {
  const stored = await getDb().collection<BusinessSettings>('business_settings').findOne({ _id: 'business' })
  return res.json({ settings: stored ? sanitizeSettings(stored) : defaults })
})

settingsRouter.put('/', async (req: AuthenticatedRequest, res) => {
  if (req.user!.role !== 'owner') return res.status(403).json({ message: 'Owner access required' })
  const businessName = typeof req.body?.businessName === 'string' ? req.body.businessName.trim() : ''
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : ''
  const address = typeof req.body?.address === 'string' ? req.body.address.trim() : ''
  const state = typeof req.body?.state === 'string' ? req.body.state.trim() : ''
  const gstNumber = typeof req.body?.gstNumber === 'string' ? req.body.gstNumber.trim().toUpperCase() : ''
  const defaultGstRate = typeof req.body?.defaultGstRate === 'number' ? req.body.defaultGstRate : Number(req.body?.defaultGstRate ?? 0)
  const currency = typeof req.body?.currency === 'string' ? req.body.currency.trim().toUpperCase() : 'INR'
  if (!businessName) return res.status(400).json({ message: 'Business name is required' })
  if (currency !== 'INR') return res.status(400).json({ message: 'Currency must be INR for now' })
  if (!Number.isFinite(defaultGstRate) || defaultGstRate < 0 || defaultGstRate > 28) return res.status(400).json({ message: 'Default GST rate must be between 0% and 28%' })

  const settings: BusinessSettings = { _id: 'business', businessName, phone, address, state, gstNumber, defaultGstRate, currency, updatedAt: new Date() }
  await getDb().collection<BusinessSettings>('business_settings').replaceOne({ _id: 'business' }, settings, { upsert: true })
  await recordAuditEvent({ actorUserId: req.user!._id, actorRole: req.user!.role, action: 'update', entity: 'business_settings', entityId: 'business' })
  return res.json({ settings: sanitizeSettings(settings) })
})
