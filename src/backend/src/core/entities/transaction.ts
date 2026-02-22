import KSUID from 'ksuid'
import { Exchange } from '../enums/exchange.enum.js'

export interface TransactionProps {
  id: string
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
  createdAt: string
}

export class TransactionEntity {
  private props: TransactionProps

  private constructor(props: TransactionProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get userId(): string { return this.props.userId }
  get email(): string { return this.props.email }
  get exchange(): Exchange { return this.props.exchange }
  get operationDate(): string { return this.props.operationDate }
  get operation(): string { return this.props.operation }
  get baseCurrency(): string { return this.props.baseCurrency }
  get baseAmount(): number { return this.props.baseAmount }
  get fee(): number { return this.props.fee }
  get currencyPrice(): number { return this.props.currencyPrice }
  get quoteAmount(): number { return this.props.quoteAmount }
  get finalBalance(): number { return this.props.finalBalance }
  get createdAt(): string { return this.props.createdAt }

  toProps(): TransactionProps {
    return { ...this.props }
  }

  toJSON() {
    return { ...this.props }
  }

  /** Reconstitutes a persisted entity from raw props — use in repositories only. */
  static reconstitute(props: TransactionProps): TransactionEntity {
    return new TransactionEntity(props)
  }

  static create(
    props: Omit<TransactionProps, 'id' | 'createdAt'> & Partial<Pick<TransactionProps, 'id'>>
  ): TransactionEntity {
    return new TransactionEntity({
      ...props,
      id: props.id ?? KSUID.randomSync().string,
      createdAt: new Date().toISOString(),
    })
  }
}
