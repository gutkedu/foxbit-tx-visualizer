import { TransactionEntity } from '@/core/entities/transaction.js'

export interface TransactionRepository {
  create(transaction: TransactionEntity): Promise<TransactionEntity>
  batchCreate(transactions: TransactionEntity[]): Promise<TransactionEntity[]>
}
