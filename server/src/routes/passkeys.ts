import { Router } from 'express'
import { Binary, ObjectId } from 'mongodb'
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticatorTransportFuture,
  type WebAuthnCredential,
} from '@simplewebauthn/server'
import { config } from '../config.js'
import { getDb } from '../db.js'
import { createToken, sanitizeUser, type UserRecord } from '../auth.js'
import { recordAuditEvent } from '../audit.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware.js'

interface PasskeyRecord {
  _id: ObjectId
  credentialId: string
  userId: ObjectId
  publicKey: Binary
  counter: number
  transports: AuthenticatorTransportFuture[]
  deviceType?: string
  backedUp?: boolean
  createdAt: Date
  updatedAt: Date
}

interface ChallengeRecord {
  _id: string
  type: 'registration' | 'authentication'
  userId?: ObjectId
  expiresAt: Date
}

const passkeyRouter = Router()

passkeyRouter.get('/register/options', requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!
  const passkeys = await getDb().collection<PasskeyRecord>('passkeys').find({ userId: user._id }).toArray()

  const options = await generateRegistrationOptions({
    rpName: config.passkeyRpName,
    rpID: config.passkeyRpId,
    userName: user.email,
    userDisplayName: user.fullName,
    attestationType: 'none',
    excludeCredentials: passkeys.map(passkey => ({ id: passkey.credentialId, transports: passkey.transports })),
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'required',
      authenticatorAttachment: 'platform',
    },
  })

  await getDb().collection<ChallengeRecord>('webauthn_challenges').insertOne({
    _id: options.challenge,
    type: 'registration',
    userId: user._id,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  })

  return res.json(options)
})

passkeyRouter.post('/register/verify', requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!
  const challenge = typeof req.body?.challenge === 'string' ? req.body.challenge : ''
  const response = req.body?.response
  if (!challenge || !response) return res.status(400).json({ message: 'Passkey registration response is required' })

  const challengeRecord = await getDb().collection<ChallengeRecord>('webauthn_challenges').findOneAndDelete({
    _id: challenge,
    type: 'registration',
    userId: user._id,
  })
  if (!challengeRecord || challengeRecord.expiresAt.getTime() < Date.now()) {
    return res.status(400).json({ message: 'Passkey registration expired. Please try again.' })
  }

  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: config.passkeyOrigin,
      expectedRPID: config.passkeyRpId,
      requireUserVerification: true,
    })

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ message: 'Passkey registration could not be verified' })
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo
    await getDb().collection<PasskeyRecord>('passkeys').insertOne({
      _id: new ObjectId(),
      credentialId: credential.id,
      userId: user._id,
      publicKey: new Binary(Buffer.from(credential.publicKey)),
      counter: credential.counter,
      transports: response.response?.transports ?? [],
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await recordAuditEvent({
      actorUserId: user._id,
      actorRole: user.role,
      action: 'create',
      entity: 'passkey',
      entityId: credential.id,
    })

    return res.status(201).json({ message: 'Passkey added. You can now use it to sign in.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Passkey registration failed'
    return res.status(400).json({ message })
  }
})

passkeyRouter.get('/login/options', async (_req, res) => {
  const options = await generateAuthenticationOptions({
    rpID: config.passkeyRpId,
    userVerification: 'required',
    allowCredentials: [],
  })

  await getDb().collection<ChallengeRecord>('webauthn_challenges').insertOne({
    _id: options.challenge,
    type: 'authentication',
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  })

  return res.json(options)
})

passkeyRouter.post('/login/verify', async (req, res) => {
  const challenge = typeof req.body?.challenge === 'string' ? req.body.challenge : ''
  const response = req.body?.response
  if (!challenge || !response?.id) return res.status(400).json({ message: 'Passkey login response is required' })

  const challengeRecord = await getDb().collection<ChallengeRecord>('webauthn_challenges').findOneAndDelete({
    _id: challenge,
    type: 'authentication',
  })
  if (!challengeRecord || challengeRecord.expiresAt.getTime() < Date.now()) {
    return res.status(401).json({ message: 'Passkey login expired. Please try again.' })
  }

  const passkey = await getDb().collection<PasskeyRecord>('passkeys').findOne({ credentialId: response.id })
  if (!passkey) return res.status(401).json({ message: 'That passkey is not registered for this business.' })

  const user = await getDb().collection<UserRecord>('users').findOne({ _id: passkey.userId })
  if (!user || !user.isActive) return res.status(403).json({ message: 'This account is inactive' })

  const credential: WebAuthnCredential = {
    id: passkey.credentialId,
    publicKey: new Uint8Array(passkey.publicKey.buffer),
    counter: passkey.counter,
    transports: passkey.transports,
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: config.passkeyOrigin,
      expectedRPID: config.passkeyRpId,
      credential,
      requireUserVerification: true,
    })

    if (!verification.verified) return res.status(401).json({ message: 'Passkey verification failed' })

    await getDb().collection<PasskeyRecord>('passkeys').updateOne(
      { _id: passkey._id },
      { $set: { counter: verification.authenticationInfo.newCounter, updatedAt: new Date() } },
    )

    await recordAuditEvent({ actorUserId: user._id, actorRole: user.role, action: 'login', entity: 'auth' })
    return res.json({ token: createToken(user), user: sanitizeUser(user) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Passkey verification failed'
    return res.status(401).json({ message })
  }
})

export { passkeyRouter }
