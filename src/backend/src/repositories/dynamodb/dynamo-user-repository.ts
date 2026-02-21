import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { UserRepository } from '../user-repository.js'
import { dynamo } from '@/shared/clients/dynamo-client.js'
import { UserDynamo, UserEntity } from '@/core/entities/user.js'
import { IntegrationError } from '@/shared/errors/integration-error.js'
import { getLogger } from '@/shared/logger/get-logger.js'

const logger = getLogger()

export class DynamoUserRepository implements UserRepository {
  private client: DynamoDBDocumentClient
  private tableName: string

  constructor() {
    this.client = dynamo()
    if (!process.env.TABLE_NAME) {
      throw new Error('TABLE_NAME environment variable is not set')
    }
    this.tableName = process.env.TABLE_NAME
  }

  async getByEmail(email: string): Promise<UserEntity | null> {
    try {
      const response = await this.client.send(
        new QueryCommand({
          IndexName: 'gsi1',
          TableName: this.tableName,
          KeyConditionExpression: 'gsi1pk = :gsi1pk AND begins_with(gsi1sk, :gsi1sk)',
          ExpressionAttributeValues: {
            ':gsi1pk': 'USER',
            ':gsi1sk': `EMAIL#${email}`
          },
          Limit: 1
        })
      )

      if (!response.Items || response.Items.length === 0) {
        return null
      }

      const user = response.Items[0] as UserDynamo

      return UserEntity.fromDynamoItem(user)
    } catch (error) {
      logger.error('Error getting user by email', { error, email })
      throw new IntegrationError('Error getting user by email')
    }
  }

  async create(user: UserEntity): Promise<UserEntity> {
    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: user.toDynamoItem()
        })
      )

      logger.info('User created successfully', {
        userId: user.id
      })

      return user
    } catch (error) {
      logger.error('Error creating user', { error })
      throw new IntegrationError('Error creating user')
    }
  }

  async update(user: UserEntity): Promise<UserEntity> {
    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: user.toDynamoItem()
        })
      )

      logger.info('User updated successfully', {
        userId: user.id
      })

      return user
    } catch (error) {
      logger.error('Error updating user', { error })
      throw new IntegrationError('Error updating user')
    }
  }

  async getByUsername(username: string): Promise<UserEntity | null> {
    try {
      const response = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            pk: 'USER',
            sk: `USERNAME#${username}`
          }
        })
      )

      if (!response.Item) {
        return null
      }

      return UserEntity.fromDynamoItem(response.Item as UserDynamo)
    } catch (error) {
      logger.error('Error getting user by username', { error, username })
      throw new IntegrationError('Error getting user')
    }
  }
}
