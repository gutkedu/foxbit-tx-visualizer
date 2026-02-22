import {
  boolean,
  decimal,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: varchar('id', { length: 27 }).primaryKey(), // KSUID
  username: varchar('username', { length: 128 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  cognitoSub: varchar('cognito_sub', { length: 255 }).notNull().unique(),
  userConfirmed: boolean('user_confirmed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const transactions = pgTable('transactions', {
  id: varchar('id', { length: 27 }).primaryKey(), // KSUID
  // Aurora DSQL does not support foreign key constraints (distributed DB);
  // referential integrity is enforced at the application layer.
  userId: varchar('user_id', { length: 27 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  // Aurora DSQL does not support CREATE TYPE AS ENUM; varchar + app-level validation
  exchange: varchar('exchange', { length: 50 }).notNull(),
  operationDate: varchar('operation_date', { length: 32 }).notNull(),
  operation: varchar('operation', { length: 128 }).notNull(),
  baseCurrency: varchar('base_currency', { length: 20 }).notNull(),
  baseAmount: decimal('base_amount', { precision: 28, scale: 10 }).notNull(),
  fee: decimal('fee', { precision: 28, scale: 10 }).notNull(),
  currencyPrice: decimal('currency_price', { precision: 28, scale: 10 }).notNull(),
  quoteAmount: decimal('quote_amount', { precision: 28, scale: 10 }).notNull(),
  finalBalance: decimal('final_balance', { precision: 28, scale: 10 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type UserRow = typeof users.$inferSelect
export type NewUserRow = typeof users.$inferInsert
export type TransactionRow = typeof transactions.$inferSelect
export type NewTransactionRow = typeof transactions.$inferInsert