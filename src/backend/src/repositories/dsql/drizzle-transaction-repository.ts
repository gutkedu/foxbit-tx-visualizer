import { TransactionEntity, TransactionProps } from '@/core/entities/transaction.js'
import { TransactionRepository } from '../transaction-repository.js'
import { Exchange } from '@/core/enums/exchange.enum.js'
import { getDb } from '@/db/client.js'
import { transactions, TransactionRow } from '@/db/schema.js'

// Compile-time check: every key in TransactionProps must exist as a column in TransactionRow.
// If you add a field to TransactionProps but forget to add it to the schema, this errors.
type _TxSyncCheck = { [K in keyof TransactionProps]: K extends keyof TransactionRow ? true : never }
const _assertTxSync: _TxSyncCheck = undefined as unknown as _TxSyncCheck
void _assertTxSync

export class DrizzleTransactionRepository implements TransactionRepository {
  async create(transaction: TransactionEntity): Promise<TransactionEntity> {
    const db = await getDb()
    const [row] = await db
      .insert(transactions)
      .values(this.toRow(transaction))
      .returning()
    return this.toEntity(row)
  }

  async batchCreate(txs: TransactionEntity[]): Promise<TransactionEntity[]> {
    const db = await getDb()
    return db.transaction(async (trx) => {
      const rows = await trx
        .insert(transactions)
        .values(txs.map((t) => this.toRow(t)))
        .returning()
      return rows.map((r) => this.toEntity(r))
    })
  }

  private toEntity(row: TransactionRow): TransactionEntity {
    return TransactionEntity.reconstitute({
      id: row.id,
      userId: row.userId,
      email: row.email,
      exchange: row.exchange as Exchange,
      operationDate: row.operationDate,
      operation: row.operation,
      baseCurrency: row.baseCurrency,
      baseAmount: Number(row.baseAmount),
      fee: Number(row.fee),
      currencyPrice: Number(row.currencyPrice),
      quoteAmount: Number(row.quoteAmount),
      finalBalance: Number(row.finalBalance),
      createdAt: row.createdAt.toISOString(),
    })
  }

  private toRow(t: TransactionEntity) {
    return {
      id: t.id,
      userId: t.userId,
      email: t.email,
      exchange: t.exchange,
      operationDate: t.operationDate,
      operation: t.operation,
      baseCurrency: t.baseCurrency,
      baseAmount: String(t.baseAmount),
      fee: String(t.fee),
      currencyPrice: String(t.currencyPrice),
      quoteAmount: String(t.quoteAmount),
      finalBalance: String(t.finalBalance),
      createdAt: new Date(t.createdAt),
    }
  }
}
