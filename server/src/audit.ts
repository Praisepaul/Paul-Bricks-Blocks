import { ObjectId } from 'mongodb'
import { getDb } from './db.js'
import type { UserRole } from './auth.js'

export type AuditAction = 'create' | 'update' | 'delete' | 'login'

export async function recordAuditEvent(input: {
  actorUserId: ObjectId
  actorRole: UserRole
  action: AuditAction
  entity: string
  entityId?: string
  details?: Record<string, unknown>
}) {
  await getDb().collection('audit_events').insertOne({
    actorUserId: input.actorUserId,
    actorRole: input.actorRole,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId ?? null,
    details: input.details ?? {},
    createdAt: new Date(),
  })
}
