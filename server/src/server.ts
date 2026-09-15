import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { connectDb } from './db.js'
import { authRouter } from './routes/auth.js'
import { usersRouter } from './routes/users.js'
import { settingsRouter } from './routes/settings.js'
import { customersRouter } from './routes/customers.js'
import { productsRouter } from './routes/products.js'
import { salesRouter } from './routes/sales.js'
import { purchasesRouter } from './routes/purchases.js'
import { expensesRouter } from './routes/expenses.js'
import { labourRouter } from './routes/labour.js'
import { billsRouter } from './routes/bills.js'
import { paymentsRouter } from './routes/payments.js'
import { historyRouter } from './routes/history.js'
import { dashboardRouter } from './routes/dashboard.js'
import { stockRouter } from './routes/stock.js'
import { reportsRouter } from './routes/reports.js'
import { ledgerRouter } from './routes/ledger.js'

const app = express(); app.use(cors({ origin: config.clientOrigin })); app.use(express.json({ limit: '1mb' })); app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter); app.use('/api/users', usersRouter); app.use('/api/settings', settingsRouter); app.use('/api/customers', customersRouter); app.use('/api/products', productsRouter); app.use('/api/sales', salesRouter); app.use('/api/purchases', purchasesRouter); app.use('/api/expenses', expensesRouter); app.use('/api/labour', labourRouter); app.use('/api/bills', billsRouter); app.use('/api/payments', paymentsRouter); app.use('/api/history', historyRouter); app.use('/api/dashboard', dashboardRouter); app.use('/api/stock', stockRouter); app.use('/api/reports', reportsRouter); app.use('/api/ledger', ledgerRouter)
async function start() { await connectDb(); app.listen(config.port, () => console.log(`API listening on port ${config.port}`)) }
start().catch((error) => { console.error(error); process.exit(1) })
