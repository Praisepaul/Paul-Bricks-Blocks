import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: required('MONGODB_URI'),
  mongoDbName: process.env.MONGODB_DB_NAME ?? 'paul_bricks_blocks',
  jwtSecret: required('JWT_SECRET'),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  passkeyRpId: process.env.PASSKEY_RP_ID ?? 'localhost',
  passkeyOrigin: process.env.PASSKEY_ORIGIN ?? 'http://localhost:5173',
  passkeyRpName: process.env.PASSKEY_RP_NAME ?? 'Paul Bricks & Blocks',
}
