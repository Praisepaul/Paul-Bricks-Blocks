import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { getDb } from '../db.js'
import { recordAuditEvent } from '../audit.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'

export interface LabourRecord {
  _id: ObjectId
  labourNumber: string
  workerName: string
  workDescription: string
  amount: number
  labourDate: string
  createdByUserId: ObjectId
  createdAt: Date
}

export const labourRouter = Router()
labourRouter.use(requireAuth)

function sanitizeLabour(labour: LabourRecord) {
  return {
    id: labour._id.toHexString(),
    labourNumber: labour.labourNumber,
    workerName: labour.workerName,
    workDescription: labour.workDescription,
    amount: labour.amount,
    labourDate: labour.labourDate,
    createdAt: labour.createdAt,
  }
}

labourRouter.get('/', async (_req: AuthenticatedRequest, res) => {
  const labour = await getDb().collection<LabourRecord>('labour').find({}).sort({ labourDate: -1, createdAt: -1 }).limit(100).toArray()
  return res.json({ labour: labour.map(sanitizeLabour) })
})

labourRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const body = req.body as Record<string, unknown> | null
  const workerName = typeof body?.workerName === 'string' ? body.workerName.trim() : ''
  const workDescription = typeof body?.workDescription === 'string' ? body.workDescription.trim() : ''
  const amount = typeof body?.amount === 'number' ? body.amount : Number(body?.amount)
  const labourDate = typeof body?.labourDate === 'string' ? body.labourDate.trim() : ''

  if (!workerName) return res.status(400).json({ message: 'Worker name is required' })
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: 'Amount must be greater than zero' })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(labourDate)) return res.status(400).json({ message: 'Valid labour date is required' })

  const labourId = new ObjectId()
  const now = new Date()
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
  const labourNumber = `LAB-${datePart}-${labourId.toHexString().slice(-6).toUpperCase()}`
  const roundedAmount = Math.round(amount * 100) / 100
  const labour: LabourRecord = {
    _id: labourId,
    labourNumber,
    workerName,
    workDescription,
    amount: roundedAmount,
    labourDate,
    createdByUserId: req.user!._id,
    createdAt: now,
  }

  await getDb().collection<LabourRecord>('labour').insertOne(labour)
  await recordAuditEvent({
    actorUserId: req.user!._id,
    actorRole: req.user!.role,
    action: 'create',
    entity: 'labour',
    entityId: labourId.toHexString(),
    details: { labourNumber, workerName, amount: roundedAmount, labourDate },
  })

  return res.status(201).json({ labour: sanitizeLabour(labour) })
})
