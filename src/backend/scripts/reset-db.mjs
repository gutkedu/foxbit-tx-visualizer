#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Drops all application tables and the drizzle migrations tracking table.
 * ⚠️  FOR DEVELOPMENT USE ONLY — this is destructive and irreversible.
 */
import { DsqlSigner } from '@aws-sdk/dsql-signer'
import pg from 'pg'

const { Client } = pg

const endpoint = process.env.DSQL_ENDPOINT
const region = process.env.AWS_REGION ?? 'us-east-1'

if (!endpoint) {
  console.error('❌  DSQL_ENDPOINT is not set')
  process.exit(1)
}

console.log('🔑  Generating IAM auth token...')
const signer = new DsqlSigner({ hostname: endpoint, region })
const token = await signer.getDbConnectAdminAuthToken()

const client = new Client({
  host: endpoint,
  port: 5432,
  user: 'admin',
  password: token,
  database: 'postgres',
  ssl: { rejectUnauthorized: true },
})
await client.connect()
console.log('✅  Connected to DSQL cluster')

try {
  const drops = [
    'DROP TABLE IF EXISTS transactions',
    'DROP TABLE IF EXISTS users',
    'DROP TABLE IF EXISTS drizzle.__drizzle_migrations',
    'DROP SCHEMA IF EXISTS drizzle',
  ]

  for (const stmt of drops) {
    console.log(`🗑️   ${stmt}`)
    await client.query(stmt)
  }

  console.log('✅  Database reset complete')
} finally {
  await client.end()
}
