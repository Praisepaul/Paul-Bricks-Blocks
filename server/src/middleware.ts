import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { config } from './config.js'
import { getDb } from './db.js'
import type { UserRecord } from './auth.js'

export interface AuthenticatedRequest extends Request {
  user?: UserRecord
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.header('authorization')
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' })

    const token = header.slice(7)
    const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload
    if (typeof payload.sub !== 'string' || !ObjectId.isValid(payload.sub)) {
      return res.status(401).json({ message: 'Invalid session' })
    }

    const user = await getDb().collection<UserRecord>('users').findOne({ _id: new ObjectId(payload.sub) })
    if (!user || !user.isActive) return res.status(401).json({ message: 'Account is inactive or missing' })

    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session' })
  }
}
