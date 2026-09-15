import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { getDb } from '../db.js'
import { createPasswordHash, sanitizeUser, type UserRecord, type UserRole } from '../auth.js'
import { recordAuditEvent } from '../audit.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'

export const usersRouter = Router()

usersRouter.use(requireAuth)

usersRouter.get('/', async (req: AuthenticatedRequest, res) => {
  if (req.user!.role !== 'owner') return res.status(403).json({ message: 'Owner access required' })

  const users = await getDb()
    .collection<UserRecord>('users')
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: 1 })
    .toArray()

  return res.json({ users: users.map(sanitizeUser) })
})

usersRouter.post('/', async (req: AuthenticatedRequest, res) => {
  if (req.user!.role !== 'owner') return res.status(403).json({ message: 'Owner access required' })

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const fullName = typeof req.body?.fullName === 'string' ? req.body.fullName.trim() : ''
  const role = req.body?.role === 'owner' || req.body?.role === 'partner' ? req.body.role as UserRole : ''

  if (!email || !fullName || password.length < 8 || !role) {
    return res.status(400).json({ message: 'Full name, email, role and a password of at least 8 characters are required' })
  }

  const users = getDb().collection<UserRecord>('users')
  const existing = await users.findOne({ email })
  if (existing) return res.status(409).json({ message: 'A user with this email already exists' })

  const now = new Date()
  const user: UserRecord = {
    _id: new ObjectId(),
    email,
    passwordHash: await createPasswordHash(password),
    fullName,
    role,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }

  await users.insertOne(user)
  await recordAuditEvent({
    actorUserId: req.user!._id,
    actorRole: req.user!.role,
    action: 'create',
    entity: 'user',
    entityId: user._id.toHexString(),
    details: { role: user.role, email: user.email },
  })

  return res.status(201).json({ user: sanitizeUser(user) })
})
