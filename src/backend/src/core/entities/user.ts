import KSUID from 'ksuid'

export interface UserProps {
  id: string
  username: string
  email: string
  cognitoSub: string
  userConfirmed: boolean
  createdAt: string
  updatedAt: string
}

export class UserEntity {
  private props: UserProps

  private constructor(props: UserProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get username(): string { return this.props.username }
  get email(): string { return this.props.email }
  get cognitoSub(): string { return this.props.cognitoSub }
  get userConfirmed(): boolean { return this.props.userConfirmed }
  get createdAt(): string { return this.props.createdAt }
  get updatedAt(): string { return this.props.updatedAt }

  set userConfirmed(value: boolean) {
    this.props.userConfirmed = value
    this.touch()
  }

  touch(): void {
    this.props.updatedAt = new Date().toISOString()
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
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  /** Reconstitutes a persisted entity from raw props — use in repositories only. */
  static reconstitute(props: UserProps): UserEntity {
    return new UserEntity(props)
  }

  static create(
    props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<UserProps, 'id'>>
  ): UserEntity {
    const now = new Date().toISOString()
    return new UserEntity({
      ...props,
      id: props.id ?? KSUID.randomSync().string,
      createdAt: now,
      updatedAt: now,
    })
  }
}
