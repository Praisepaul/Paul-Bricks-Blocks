import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { config } from '../config.js'
import { getDb } from '../db.js'
import { createPasswordHash, createToken, findUserByEmail, sanitizeUser, verifyPassword, type UserRecord } from '../auth.js'
import { recordAuditEvent } from '../audit.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const user = await findUserByEmail(email)

  if (!user || !(await verifyPassword(user, password))) {
    return res.status(401).json({ message: 'Email or password is incorrect' })
  }
  if (!user.isActive) return res.status(403).json({ message: 'This account is inactive' })

  await recordAuditEvent({ actorUserId: user._id, actorRole: user.role, action: 'login', entity: 'auth' })
  return res.json({ token: createToken(user), user: sanitizeUser(user) })
})

authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: sanitizeUser(req.user!) })
})

// Used once during local setup. It refuses to create anything if a user already exists.
authRouter.post('/bootstrap-owner', async (req, res) => {
  const users = getDb().collection<UserRecord>('users')
  if (await users.countDocuments({}) > 0) {
    return res.status(409).json({ message: 'Bootstrap is already complete' })
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const fullName = typeof req.body?.fullName === 'string' ? req.body.fullName.trim() : ''

  if (!email || password.length < 8 || !fullName) {
    return res.status(400).json({ message: 'Full name, email and a password of at least 8 characters are required' })
  }

  const now = new Date()
  const user: UserRecord = {
    _id: new ObjectId(),
    email,
    passwordHash: await createPasswordHash(password),
    fullName,
    role: 'owner',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }

  await users.insertOne(user)
  await recordAuditEvent({ actorUserId: user._id, actorRole: user.role, action: 'create', entity: 'user', entityId: user._id.toHexString() })
  return res.status(201).json({ message: 'Owner account created. You can now sign in.' })
})
