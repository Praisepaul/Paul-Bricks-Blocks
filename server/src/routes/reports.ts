import { Router } from 'express'
import { getDb } from '../db.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'

export const reportsRouter = Router()
reportsRouter.use(requireAuth)

function validDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function round(value: number) {
  return Math.round(value * 100) / 100
}

reportsRouter.get('/summary', async (req: AuthenticatedRequest, res) => {
  const today = new Date().toISOString().slice(0, 10)
  const from = validDate(req.query.from) ? req.query.from : today
  const to = validDate(req.query.to) ? req.query.to : today
  if (from > to) return res.status(400).json({ message: 'From date must be before or equal to the To date' })

  const db = getDb()
  const start = new Date(`${from}T00:00:00.000Z`)
  const end = new Date(`${to}T23:59:59.999Z`)
  const [sales, purchases, expenses, labour, bills, stock] = await Promise.all([
    db.collection('sales').aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, subtotal: { $sum: { $ifNull: ['$subtotal', '$totalAmount'] } }, gst: { $sum: { $ifNull: ['$taxAmount', 0] } }, count: { $sum: 1 } } },
    ]).toArray(),
    db.collection('purchases').aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]).toArray(),
    db.collection('expenses').aggregate([
      { $match: { expenseDate: { $gte: from, $lte: to } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]).toArray(),
    db.collection('labour').aggregate([
      { $match: { labourDate: { $gte: from, $lte: to } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]).toArray(),
    db.collection('bills').aggregate([
      { $match: { billDate: { $gte: from, $lte: to }, isPaid: false } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]).toArray(),
    db.collection('stock').aggregate([
      { $group: { _id: '$productId', purchased: { $sum: 0 }, sold: { $sum: 0 } } },
    ]).toArray(),
  ])

  const value = (result: Array<{ total?: number }>) => round(Number(result[0]?.total ?? 0))
  const salesTotal = value(sales)
  const purchaseTotal = value(purchases)
  const expenseTotal = value(expenses)
  const labourTotal = value(labour)
  const operatingOutflow = round(purchaseTotal + expenseTotal + labourTotal)

  return res.json({
    from,
    to,
    sales: { subtotal: value(sales), gst: round(Number(sales[0]?.gst ?? 0)), total: salesTotal, count: Number(sales[0]?.count ?? 0) },
    purchases: { total: purchaseTotal, count: Number(purchases[0]?.count ?? 0), inputGst: 0, inputGstCaptured: false },
    expenses: { total: expenseTotal, count: Number(expenses[0]?.count ?? 0) },
    labour: { total: labourTotal, count: Number(labour[0]?.count ?? 0) },
    unpaidBills: { total: value(bills), count: Number(bills[0]?.count ?? 0) },
    operatingOutflow,
    cashMovementBeforeStockAndTax: round(salesTotal - operatingOutflow),
    stockNote: 'Stock value is not included in profit because purchase cost and stock valuation are not yet tracked by accounting period.',
  })
})
