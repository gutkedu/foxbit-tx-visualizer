import { Item } from './item.js'
import KSUID from 'ksuid'

export interface UserProps {
  id?: string
  username: string
  email: string
  cognitoSub: string
  userConfirmed?: boolean
  createdAt?: string
  updatedAt?: string
}

interface UserDynamoKeys {
  pk: `USER`
  sk: `USERNAME#${string}`
  gsi1pk: `USER`
  gsi1sk: `EMAIL#${string}`
}

export interface UserDynamo extends UserProps, UserDynamoKeys {}

export class UserEntity extends Item<UserProps> {
  get pk(): UserDynamoKeys['pk'] {
    return `USER`
  }

  get sk(): UserDynamoKeys['sk'] {
    return `USERNAME#${this.props.username}`
  }

  get gsi1pk(): UserDynamoKeys['gsi1pk'] {
    return `USER`
  }

  get gsi1sk(): UserDynamoKeys['gsi1sk'] {
    return `EMAIL#${this.props.email}`
  }

  get id(): string {
    return this.props.id as string
  }

  get username(): string {
    return this.props.username
  }

  get email(): string {
    return this.props.email
  }

  get cognitoSub(): string {
    return this.props.cognitoSub
  }

  get userConfirmed(): boolean {
    return this.props.userConfirmed ?? false
  }

  set userConfirmed(value: boolean) {
    this.props.userConfirmed = value
    this.touch()
  }

  touch(): void {
    this.props.updatedAt = new Date().toISOString()
  }

  getDynamoKeys(): UserDynamoKeys {
    return {
      pk: this.pk,
      sk: this.sk,
      gsi1pk: this.gsi1pk,
      gsi1sk: this.gsi1sk
    }
  }

  toDynamoItem(): UserDynamo {
    return {
      ...this.getDynamoKeys(),
      ...this.props
    }
  }

  toProps(): UserProps {
    return { ...this.props }
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      userConfirmed: this.userConfirmed,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    }
  }

  static fromDynamoItem(item: UserDynamo): UserEntity {
    return new UserEntity(item)
  }

  static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<UserProps, 'id'>>): UserEntity {
    const now = new Date().toISOString()
    return new UserEntity({
      ...props,
      id: props.id ?? KSUID.randomSync().string,
      userConfirmed: props.userConfirmed ?? false,
      createdAt: now,
      updatedAt: now
    })
  }
}
