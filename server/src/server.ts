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

const app = express()
app.use(cors({ origin: config.clientOrigin }))
app.use(express.json({ limit: '1mb' }))
app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/customers', customersRouter)
app.use('/api/products', productsRouter)
app.use('/api/sales', salesRouter)
app.use('/api/purchases', purchasesRouter)

async function start() {
  await connectDb()
  app.listen(config.port, () => console.log(`API listening on port ${config.port}`))
}

start().catch((error) => { console.error(error); process.exit(1) })
