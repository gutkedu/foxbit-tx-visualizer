import { APIGatewayProxyHandler } from 'aws-lambda'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { getDb } from '@/db/client.js'
import { getLogger } from '@/shared/logger/get-logger.js'

const logger = getLogger('MigrateFunction')

export const migrateHandler: APIGatewayProxyHandler = async () => {
  logger.info('Running database migrations...')

  try {
    const db = await getDb()
    await migrate(db, { migrationsFolder: './src/db/migrations' })
    logger.info('Migrations completed successfully')
    return { statusCode: 200, body: JSON.stringify({ message: 'Migrations applied successfully' }) }
  } catch (error) {
    logger.error('Migration failed', { error })
    return { statusCode: 500, body: JSON.stringify({ message: 'Migration failed', error: String(error) }) }
  }
}
