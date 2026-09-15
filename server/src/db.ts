import { MongoClient, Db } from 'mongodb'
import { config } from './config.js'
let client: MongoClient | null = null
let db: Db | null = null
export async function connectDb(): Promise<Db> {
  if (db) return db
  client = new MongoClient(config.mongoUri); await client.connect(); db = client.db(config.mongoDbName)
  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('audit_events').createIndex({ createdAt: -1 }), db.collection('audit_events').createIndex({ actorUserId: 1, createdAt: -1 }),
    db.collection('customers').createIndex({ name: 1 }), db.collection('suppliers').createIndex({ name: 1 }, { unique: true }), db.collection('suppliers').createIndex({ isActive: 1, name: 1 }),
    db.collection('products').createIndex({ name: 1 }), db.collection('sales').createIndex({ createdAt: -1 }), db.collection('sales').createIndex({ invoiceNumber: 1 }, { unique: true }),
    db.collection('purchases').createIndex({ createdAt: -1 }), db.collection('purchases').createIndex({ purchaseNumber: 1 }, { unique: true }), db.collection('purchases').createIndex({ supplierId: 1, createdAt: -1 }),
    db.collection('expenses').createIndex({ expenseDate: -1, createdAt: -1 }), db.collection('expenses').createIndex({ expenseNumber: 1 }, { unique: true }),
    db.collection('labour').createIndex({ labourDate: -1, createdAt: -1 }), db.collection('labour').createIndex({ labourNumber: 1 }, { unique: true }),
    db.collection('bills').createIndex({ isPaid: 1, dueDate: 1, createdAt: -1 }), db.collection('bills').createIndex({ billNumber: 1 }, { unique: true }),
    db.collection('payments').createIndex({ paymentDate: -1, createdAt: -1 }), db.collection('payments').createIndex({ kind: 1, customerId: 1, createdAt: -1 }), db.collection('payments').createIndex({ kind: 1, supplierId: 1, createdAt: -1 }), db.collection('payments').createIndex({ kind: 1, supplierName: 1, createdAt: -1 }),
    db.collection('stock_movements').createIndex({ productId: 1, createdAt: -1 }),
    db.collection('attachments.files').createIndex({ 'metadata.entityType': 1, 'metadata.entityId': 1, uploadDate: -1 }),
    db.collection('passkeys').createIndex({ credentialId: 1 }, { unique: true }),
    db.collection('passkeys').createIndex({ userId: 1, createdAt: -1 }),
    db.collection('webauthn_challenges').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ])
  return db
}
export function getDb(): Db { if (!db) throw new Error('MongoDB is not connected'); return db }
