import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'
import { buildLedger } from '../ledger.js'

export const ledgerRouter = Router()
ledgerRouter.use(requireAuth)

ledgerRouter.get('/', async (req: AuthenticatedRequest, res) => {
  const fromRaw = typeof req.query.from === 'string' ? req.query.from : ''
  const toRaw = typeof req.query.to === 'string' ? req.query.to : ''
  const from = fromRaw ? new Date(`${fromRaw}T00:00:00`) : undefined
  const to = toRaw ? new Date(`${toRaw}T23:59:59.999`) : undefined
  if (from && Number.isNaN(from.getTime())) return res.status(400).json({ message: 'Invalid from date' })
  if (to && Number.isNaN(to.getTime())) return res.status(400).json({ message: 'Invalid to date' })
  if (from && to && from > to) return res.status(400).json({ message: 'From date cannot be after to date' })

  const entries = await buildLedger(from, to)
  return res.json({ entries: entries.map((entry) => ({ ...entry, date: entry.date })) })
})
