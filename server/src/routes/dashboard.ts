import { Router } from 'express'
import { getDb } from '../db.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'
export const dashboardRouter = Router(); dashboardRouter.use(requireAuth)
dashboardRouter.get('/today', async (_req: AuthenticatedRequest, res) => {
  const db = getDb(); const today = new Date().toISOString().slice(0, 10); const startOfToday = new Date(`${today}T00:00:00.000Z`)
  const [sales, purchases, expenses, labour, unpaidBills] = await Promise.all([
    db.collection('sales').aggregate([{ $match: { createdAt: { $gte: startOfToday } } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, subtotal: { $sum: { $ifNull: ['$subtotal', '$totalAmount'] } }, gst: { $sum: { $ifNull: ['$taxAmount', 0] } } } }]).toArray(),
    db.collection('purchases').aggregate([{ $match: { createdAt: { $gte: startOfToday } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]).toArray(),
    db.collection('expenses').aggregate([{ $match: { expenseDate: today } }, { $group: { _id: null, total: { $sum: '$amount' } } }]).toArray(),
    db.collection('labour').aggregate([{ $match: { labourDate: today } }, { $group: { _id: null, total: { $sum: '$amount' } } }]).toArray(),
    db.collection('bills').aggregate([{ $match: { isPaid: false } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]).toArray(),
  ])
  const value = (result: Array<{ total?: number }>) => Math.round(Number(result[0]?.total ?? 0) * 100) / 100
  return res.json({ today, sales: value(sales), salesSubtotal: Math.round(Number(sales[0]?.subtotal ?? 0) * 100) / 100, gstCollected: Math.round(Number(sales[0]?.gst ?? 0) * 100) / 100, purchases: value(purchases), expenses: value(expenses), labour: value(labour), unpaidBills: value(unpaidBills), unpaidBillCount: Number(unpaidBills[0]?.count ?? 0) })
})
