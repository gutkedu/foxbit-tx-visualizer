import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DSQL_ENDPOINT ?? '',
    port: 5432,
    user: 'admin',
    // Password (IAM token) must be set externally via PGPASSWORD env var
    // before running drizzle-kit commands locally.
    // e.g.: export PGPASSWORD=$(aws dsql generate-db-connect-admin-auth-token --hostname $DSQL_ENDPOINT)
    password: process.env.PGPASSWORD ?? '',
    database: 'postgres',
    ssl: true,
  },
} satisfies Config
