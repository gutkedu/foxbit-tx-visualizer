import { Item } from './item.js'
import KSUID from 'ksuid'
import { Exchange } from '../enums/exchange.enum.js'

export interface TransactionProps {
  id?: string
  userId: string
  email: string
  exchange: Exchange
  operationDate: string
  operation: string
  baseCurrency: string
  baseAmount: number
  fee: number
  currencyPrice: number
  quoteAmount: number
  finalBalance: number
  createdAt?: string
}

interface TransactionDynamoKeys {
  pk: `USER#${string}`
  sk: `TX#${Exchange}#${string}#${string}`
  gsi1pk: `EXCHANGE#${Exchange}`
  gsi1sk: `TX#${string}#${string}`
}

export interface TransactionDynamo extends TransactionProps, TransactionDynamoKeys {}

export class TransactionEntity extends Item<TransactionProps> {
  get pk(): TransactionDynamoKeys['pk'] {
    return `USER#${this.props.userId}`
  }

  // sk = TX#<exchange>#<operationDate>#<id>
  get sk(): TransactionDynamoKeys['sk'] {
    return `TX#${this.props.exchange}#${this.props.operationDate}#${this.props.id}`
  }

  // GSI1 — query all transactions for a given exchange, sorted by date
  get gsi1pk(): TransactionDynamoKeys['gsi1pk'] {
    return `EXCHANGE#${this.props.exchange}`
  }

  // gsi1sk = TX#<operationDate>#<id> — supports date range queries across all users for an exchange
  get gsi1sk(): TransactionDynamoKeys['gsi1sk'] {
    return `TX#${this.props.operationDate}#${this.props.id}`
  }

  get id(): string {
    return this.props.id as string
  }

  get userId(): string {
    return this.props.userId
  }

  get email(): string {
    return this.props.email
  }

  get exchange(): Exchange {
    return this.props.exchange
  }

  get operationDate(): string {
    return this.props.operationDate
  }

  get operation(): string {
    return this.props.operation
  }

  get baseCurrency(): string {
    return this.props.baseCurrency
  }

  get baseAmount(): number {
    return this.props.baseAmount
  }

  get fee(): number {
    return this.props.fee
  }

  get currencyPrice(): number {
    return this.props.currencyPrice
  }

  get quoteAmount(): number {
    return this.props.quoteAmount
  }

  get finalBalance(): number {
    return this.props.finalBalance
  }

  getDynamoKeys(): TransactionDynamoKeys {
    return {
      pk: this.pk,
      sk: this.sk,
      gsi1pk: this.gsi1pk,
      gsi1sk: this.gsi1sk
    }
  }

  toDynamoItem(): TransactionDynamo {
    return {
      ...this.getDynamoKeys(),
      ...this.props
    }
  }

  toProps(): TransactionProps {
    return { ...this.props }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      email: this.email,
      exchange: this.exchange,
      operationDate: this.operationDate,
      operation: this.operation,
      baseCurrency: this.baseCurrency,
      baseAmount: this.baseAmount,
      fee: this.fee,
      currencyPrice: this.currencyPrice,
      quoteAmount: this.quoteAmount,
      finalBalance: this.finalBalance,
      createdAt: this.props.createdAt
    }
  }

  static fromDynamoItem(item: TransactionDynamo): TransactionEntity {
    return new TransactionEntity(item)
  }

  static create(
    props: Omit<TransactionProps, 'id' | 'createdAt'> & Partial<Pick<TransactionProps, 'id'>>
  ): TransactionEntity {
    return new TransactionEntity({
      ...props,
      id: props.id ?? KSUID.randomSync().string,
      createdAt: new Date().toISOString()
    })
  }
}
