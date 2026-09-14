import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { getDb } from './db.js'
import { config } from './config.js'

export type UserRole = 'owner' | 'partner'

export interface UserRecord {
  _id: ObjectId
  email: string
  passwordHash: string
  fullName: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export function permissionsFor(role: UserRole) {
  return role === 'owner'
    ? ['view', 'create', 'edit', 'delete', 'manage_users', 'manage_settings']
    : ['view', 'create', 'edit']
}

export async function findUserByEmail(email: string) {
  return getDb().collection<UserRecord>('users').findOne({ email: email.toLowerCase().trim() })
}

export async function verifyPassword(user: UserRecord, password: string) {
  return bcrypt.compare(password, user.passwordHash)
}

export function createToken(user: UserRecord) {
  return jwt.sign(
    { sub: user._id.toHexString(), role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' },
  )
}

export function sanitizeUser(user: UserRecord) {
  return {
    id: user._id.toHexString(),
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    isActive: user.isActive,
    permissions: permissionsFor(user.role),
  }
}

export async function createPasswordHash(password: string) {
  return bcrypt.hash(password, 12)
}
