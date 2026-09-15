import { MongoClient, Db } from 'mongodb'
import { config } from './config.js'
let client: MongoClient | null = null
let db: Db | null = null
export async function connectDb(): Promise<Db> {
  if (db) return db
  client = new MongoClient(config.mongoUri); await client.connect(); db = client.db(config.mongoDbName)
  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('audit_events').createIndex({ createdAt: -1 }),
    db.collection('audit_events').createIndex({ actorUserId: 1, createdAt: -1 }),
    db.collection('customers').createIndex({ name: 1 }),
    db.collection('products').createIndex({ name: 1 }),
    db.collection('sales').createIndex({ createdAt: -1 }),
    db.collection('sales').createIndex({ invoiceNumber: 1 }, { unique: true }),
    db.collection('purchases').createIndex({ createdAt: -1 }),
    db.collection('purchases').createIndex({ purchaseNumber: 1 }, { unique: true }),
    db.collection('expenses').createIndex({ expenseDate: -1, createdAt: -1 }),
    db.collection('expenses').createIndex({ expenseNumber: 1 }, { unique: true }),
  ])
  return db
}
export function getDb(): Db { if (!db) throw new Error('MongoDB is not connected'); return db }
