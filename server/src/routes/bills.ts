import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { getDb } from '../db.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'
import { recordAuditEvent } from '../audit.js'

interface BillRecord { _id: ObjectId; billNumber: string; title: string; category: string; amount: number; billDate: string; dueDate: string; isPaid: boolean; paidDate: string | null; notes: string; createdByUserId: ObjectId; createdAt: Date; updatedAt: Date }
interface BillPaymentRecord { _id: ObjectId; kind: 'bill_payment'; billId: ObjectId; billNumber: string; amount: number; paymentDate: string; method: string; reference: string; createdByUserId: ObjectId; createdAt: Date }

export const billsRouter = Router(); billsRouter.use(requireAuth)
function validDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) }
function makeBillNumber(date: string) { return `BILL-${date.replaceAll('-', '')}-${new ObjectId().toHexString().slice(-6).toUpperCase()}` }
function clean(record: BillRecord) { return { id: record._id.toHexString(), billNumber: record.billNumber, title: record.title, category: record.category, amount: record.amount, billDate: record.billDate, dueDate: record.dueDate, isPaid: record.isPaid, paidDate: record.paidDate, notes: record.notes, createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString() } }

billsRouter.get('/', async (_req, res) => { const records = await getDb().collection<BillRecord>('bills').find({}).sort({ isPaid: 1, dueDate: 1, createdAt: -1 }).limit(100).toArray(); res.json(records.map(clean)) })

billsRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const title = String(req.body?.title ?? '').trim(); const category = String(req.body?.category ?? '').trim(); const amount = Number(req.body?.amount); const billDate = String(req.body?.billDate ?? '').trim(); const dueDate = String(req.body?.dueDate ?? '').trim(); const notes = String(req.body?.notes ?? '').trim()
  if (!title) return res.status(400).json({ message: 'Bill name is required.' }); if (!category) return res.status(400).json({ message: 'Category is required.' }); if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0.' }); if (!validDate(billDate)) return res.status(400).json({ message: 'Bill date must be YYYY-MM-DD.' }); if (dueDate && !validDate(dueDate)) return res.status(400).json({ message: 'Due date must be YYYY-MM-DD.' }); if (dueDate && dueDate < billDate) return res.status(400).json({ message: 'Due date cannot be before the bill date.' })
  const now = new Date(); const record: BillRecord = { _id: new ObjectId(), billNumber: makeBillNumber(billDate), title, category, amount: Math.round(amount * 100) / 100, billDate, dueDate, isPaid: false, paidDate: null, notes, createdByUserId: req.user!._id, createdAt: now, updatedAt: now }
  await getDb().collection<BillRecord>('bills').insertOne(record); await recordAuditEvent({ actorUserId: req.user!._id, actorRole: req.user!.role, action: 'create', entity: 'bills', entityId: record._id.toHexString(), details: { billNumber: record.billNumber, title: record.title, amount: record.amount } }); res.status(201).json(clean(record))
})

billsRouter.put('/:id/pay', async (req: AuthenticatedRequest, res) => {
  const idValue = String(req.params.id)
  if (!ObjectId.isValid(idValue)) return res.status(400).json({ message: 'Invalid bill id.' })
  const id = new ObjectId(idValue); const db = getDb(); const record = await db.collection<BillRecord>('bills').findOne({ _id: id })
  if (!record) return res.status(404).json({ message: 'Bill not found.' }); if (record.isPaid) return res.status(400).json({ message: 'Bill is already marked paid.' })
  const paidDate = String(req.body?.paidDate ?? new Date().toISOString().slice(0, 10)).trim(); const method = String(req.body?.method ?? 'Cash').trim() || 'Cash'; const reference = String(req.body?.reference ?? '').trim()
  if (!validDate(paidDate)) return res.status(400).json({ message: 'Paid date must be YYYY-MM-DD.' })
  const now = new Date(); const payment: BillPaymentRecord = { _id: new ObjectId(), kind: 'bill_payment', billId: id, billNumber: record.billNumber, amount: record.amount, paymentDate: paidDate, method, reference, createdByUserId: req.user!._id, createdAt: now }
  await db.collection<BillPaymentRecord>('payments').insertOne(payment); const updatedAt = now; await db.collection<BillRecord>('bills').updateOne({ _id: id }, { $set: { isPaid: true, paidDate, updatedAt } })
  const updated = { ...record, isPaid: true, paidDate, updatedAt }; await recordAuditEvent({ actorUserId: req.user!._id, actorRole: req.user!.role, action: 'update', entity: 'bills', entityId: id.toHexString(), details: { billNumber: record.billNumber, status: 'paid', paidDate, paymentMethod: method } }); res.json(clean(updated))
})
