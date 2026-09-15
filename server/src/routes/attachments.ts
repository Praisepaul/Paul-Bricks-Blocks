import { Router } from 'express'
import { GridFSBucket, ObjectId } from 'mongodb'
import { getDb } from '../db.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'
import { recordAuditEvent } from '../audit.js'

export const attachmentsRouter = Router()
const MAX_FILE_SIZE = 5 * 1024 * 1024
const allowedEntityTypes = new Set(['customer', 'supplier', 'product', 'sale', 'purchase', 'expense', 'bill'])

function bucket() { return new GridFSBucket(getDb(), { bucketName: 'attachments' }) }
function cleanFileName(name: string) { return name.replace(/[^a-zA-Z0-9._ -]/g, '_').trim().slice(0, 160) || 'document' }

attachmentsRouter.use(requireAuth)

attachmentsRouter.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const entityType = String(req.query.entityType ?? '')
    const entityId = String(req.query.entityId ?? '')
    if (!allowedEntityTypes.has(entityType) || !ObjectId.isValid(entityId)) return res.status(400).json({ message: 'A valid record is required.' })
    const files = await bucket().find({ 'metadata.entityType': entityType, 'metadata.entityId': entityId }).sort({ uploadDate: -1 }).toArray()
    return res.json(files.map(file => ({ id: file._id.toHexString(), fileName: file.filename, mimeType: String(file.metadata?.mimeType ?? 'application/octet-stream'), size: file.length, uploadedAt: file.uploadDate.toISOString() })))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Unable to load documents.' })
  }
})

attachmentsRouter.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { entityType, entityId, fileName, mimeType, data } = req.body ?? {}
    if (!allowedEntityTypes.has(String(entityType)) || !ObjectId.isValid(String(entityId))) return res.status(400).json({ message: 'A valid record is required.' })
    if (typeof fileName !== 'string' || typeof mimeType !== 'string' || typeof data !== 'string') return res.status(400).json({ message: 'File data is required.' })
    const buffer = Buffer.from(data, 'base64')
    if (!buffer.length) return res.status(400).json({ message: 'The selected file is empty.' })
    if (buffer.length > MAX_FILE_SIZE) return res.status(400).json({ message: 'Files must be 5 MB or smaller.' })
    const safeName = cleanFileName(fileName)
    const upload = bucket().openUploadStream(safeName, { metadata: { entityType: String(entityType), entityId: String(entityId), mimeType: mimeType.slice(0, 120), uploadedByUserId: req.user!._id.toHexString() } })
    await new Promise<void>((resolve, reject) => { upload.on('finish', () => resolve()); upload.on('error', reject); upload.end(buffer) })
    await recordAuditEvent({ action: 'create', entity: 'attachment', entityId: upload.id.toHexString(), actorUserId: req.user!._id, actorRole: req.user!.role, details: { entityType, entityId, fileName: safeName, size: buffer.length } })
    return res.status(201).json({ id: upload.id.toHexString(), fileName: safeName, mimeType, size: buffer.length, uploadedAt: new Date().toISOString() })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Unable to save the document.' })
  }
})

attachmentsRouter.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const idValue = String(req.params.id)
    if (!ObjectId.isValid(idValue)) return res.status(400).json({ message: 'Invalid document.' })
    const id = new ObjectId(idValue)
    const file = await getDb().collection('attachments.files').findOne({ _id: id })
    if (!file) return res.status(404).json({ message: 'Document not found.' })
    res.setHeader('Content-Type', String(file.metadata?.mimeType ?? 'application/octet-stream'))
    res.setHeader('Content-Disposition', `inline; filename="${String(file.filename).replace(/"/g, '')}"`)
    return bucket().openDownloadStream(id).pipe(res)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Unable to open the document.' })
  }
})

attachmentsRouter.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const idValue = String(req.params.id)
    if (!ObjectId.isValid(idValue)) return res.status(400).json({ message: 'Invalid document.' })
    const id = new ObjectId(idValue)
    const file = await getDb().collection('attachments.files').findOne({ _id: id })
    if (!file) return res.status(404).json({ message: 'Document not found.' })
    const uploadedByUserId = String(file.metadata?.uploadedByUserId ?? '')
    if (req.user!.role !== 'owner' && uploadedByUserId !== req.user!._id.toHexString()) return res.status(403).json({ message: 'Only the owner or the person who added this document can delete it.' })
    await bucket().delete(id)
    await recordAuditEvent({ action: 'delete', entity: 'attachment', entityId: id.toHexString(), actorUserId: req.user!._id, actorRole: req.user!.role, details: { fileName: file.filename, entityType: file.metadata?.entityType, entityId: file.metadata?.entityId } })
    return res.json({ ok: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Unable to delete the document.' })
  }
})
