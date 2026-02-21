import { DynamoDBDocumentClient, PutCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { TransactionRepository } from '../transaction-repository.js'
import { dynamo } from '@/shared/clients/dynamo-client.js'
import { TransactionEntity } from '@/core/entities/transaction.js'
import { IntegrationError } from '@/shared/errors/integration-error.js'
import { getLogger } from '@/shared/logger/get-logger.js'

const logger = getLogger()

export class DynamoTransactionRepository implements TransactionRepository {
  private client: DynamoDBDocumentClient
  private tableName: string

  constructor() {
    this.client = dynamo()
    if (!process.env.TABLE_NAME) {
      throw new Error('TABLE_NAME environment variable is not set')
    }
    this.tableName = process.env.TABLE_NAME
  }

  async create(transaction: TransactionEntity): Promise<TransactionEntity> {
    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: transaction.toDynamoItem()
        })
      )

      logger.info('Transaction created successfully', {
        transactionId: transaction.id,
        userId: transaction.userId
      })

      return transaction
    } catch (error) {
      logger.error('Error creating transaction', { error })
      throw new IntegrationError('Error creating transaction')
    }
  }

  async batchCreate(transactions: TransactionEntity[]): Promise<TransactionEntity[]> {
    if (transactions.length === 0) return []
    if (transactions.length > 100) {
      throw new Error('DynamoDB transactions support a maximum of 100 items')
    }

    try {
      await this.client.send(
        new TransactWriteCommand({
          TransactItems: transactions.map((transaction) => ({
            Put: {
              TableName: this.tableName,
              Item: transaction.toDynamoItem()
            }
          }))
        })
      )

      logger.info('Transactions batch created successfully', {
        count: transactions.length,
        userId: transactions[0].userId
      })

      return transactions
    } catch (error) {
      logger.error('Error batch creating transactions', { error })
      throw new IntegrationError('Error batch creating transactions')
    }
  }
}
