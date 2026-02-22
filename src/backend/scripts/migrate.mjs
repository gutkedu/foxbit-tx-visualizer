#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Custom migration runner for Aurora DSQL.
 *
 * Aurora DSQL does not support SERIAL / sequences, so drizzle-kit's built-in
 * `migrate` command fails when it tries to create its internal tracking table
 * with `id SERIAL PRIMARY KEY`. This script creates a compatible tracking
 * table (hash TEXT PRIMARY KEY) and applies pending migrations manually.
 */
import { DsqlSigner } from '@aws-sdk/dsql-signer'
import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = resolve(__dirname, '../src/db/migrations')

const endpoint = process.env.DSQL_ENDPOINT
const region = process.env.AWS_REGION ?? 'us-east-1'

if (!endpoint) {
  console.error('❌  DSQL_ENDPOINT is not set')
  process.exit(1)
}

// 1. Generate IAM auth token
console.log('🔑  Generating IAM auth token...')
const signer = new DsqlSigner({ hostname: endpoint, region })
const token = await signer.getDbConnectAdminAuthToken()

// 2. Connect
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
  // 3. Create the drizzle tracking schema + table (DSQL-compatible — no SERIAL)
  await client.query(`CREATE SCHEMA IF NOT EXISTS drizzle`)
  await client.query(`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      hash        TEXT    PRIMARY KEY,
      created_at  BIGINT
    )
  `)

  // 4. Load the journal
  const journal = JSON.parse(readFileSync(`${migrationsDir}/meta/_journal.json`, 'utf8'))

  // 5. Find already-applied migrations
  const { rows: applied } = await client.query(
    `SELECT hash FROM drizzle.__drizzle_migrations`
  )
  const appliedHashes = new Set(applied.map((r) => r.hash))

  // 6. Apply pending migrations
  let count = 0
  for (const entry of journal.entries) {
    if (appliedHashes.has(entry.tag)) continue

    const sqlFile = resolve(migrationsDir, `${entry.tag}.sql`)
    const sql = readFileSync(sqlFile, 'utf8')

    console.log(`⚡  Applying migration: ${entry.tag}`)

    // Drizzle separates statements with '--> statement-breakpoint'
    const statements = sql
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean)
      // Make DDL idempotent: Aurora DSQL has no transactional DDL, so partial
      // applies are possible. IF NOT EXISTS prevents re-run failures.
      .map((s) => s.replace(/^CREATE TABLE(\s)/i, 'CREATE TABLE IF NOT EXISTS$1'))
      .map((s) => s.replace(/^CREATE INDEX(\s)/i, 'CREATE INDEX IF NOT EXISTS$1'))
      .map((s) => s.replace(/^CREATE UNIQUE INDEX(\s)/i, 'CREATE UNIQUE INDEX IF NOT EXISTS$1'))

    for (const statement of statements) {
      await client.query(statement)
    }

    await client.query(
      `INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)`,
      [entry.tag, Date.now()]
    )
    count++
  }

  if (count === 0) {
    console.log('✅  No pending migrations')
  } else {
    console.log(`✅  Applied ${count} migration(s) successfully`)
  }
} finally {
  await client.end()
}
