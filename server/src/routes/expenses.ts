import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { getDb } from '../db.js'
import { recordAuditEvent } from '../audit.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'

export interface ExpenseRecord {
  _id: ObjectId
  expenseNumber: string
  category: string
  description: string
  amount: number
  expenseDate: string
  createdByUserId: ObjectId
  createdAt: Date
}

export const expensesRouter = Router()
expensesRouter.use(requireAuth)

function sanitizeExpense(expense: ExpenseRecord) {
  return {
    id: expense._id.toHexString(),
    expenseNumber: expense.expenseNumber,
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    expenseDate: expense.expenseDate,
    createdAt: expense.createdAt,
  }
}

expensesRouter.get('/', async (_req: AuthenticatedRequest, res) => {
  const expenses = await getDb().collection<ExpenseRecord>('expenses').find({}).sort({ expenseDate: -1, createdAt: -1 }).limit(100).toArray()
  return res.json({ expenses: expenses.map(sanitizeExpense) })
})

expensesRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const body = req.body as Record<string, unknown> | null
  const category = typeof body?.category === 'string' ? body.category.trim() : ''
  const description = typeof body?.description === 'string' ? body.description.trim() : ''
  const amount = typeof body?.amount === 'number' ? body.amount : Number(body?.amount)
  const expenseDate = typeof body?.expenseDate === 'string' ? body.expenseDate.trim() : ''

  if (!category) return res.status(400).json({ message: 'Expense category is required' })
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: 'Amount must be greater than zero' })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)) return res.status(400).json({ message: 'Valid expense date is required' })

  const expenseId = new ObjectId()
  const now = new Date()
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
  const expenseNumber = `EXP-${datePart}-${expenseId.toHexString().slice(-6).toUpperCase()}`
  const roundedAmount = Math.round(amount * 100) / 100
  const expense: ExpenseRecord = {
    _id: expenseId,
    expenseNumber,
    category,
    description,
    amount: roundedAmount,
    expenseDate,
    createdByUserId: req.user!._id,
    createdAt: now,
  }

  await getDb().collection<ExpenseRecord>('expenses').insertOne(expense)
  await recordAuditEvent({
    actorUserId: req.user!._id,
    actorRole: req.user!.role,
    action: 'create',
    entity: 'expense',
    entityId: expenseId.toHexString(),
    details: { expenseNumber, category, amount: roundedAmount, expenseDate },
  })

  return res.status(201).json({ expense: sanitizeExpense(expense) })
})
