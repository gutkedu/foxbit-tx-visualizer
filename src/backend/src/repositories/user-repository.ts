import { UserEntity } from '@/core/entities/user.js'

export interface UserRepository {
  create(user: UserEntity): Promise<UserEntity>
  update(user: UserEntity): Promise<UserEntity>
  getByUsername(username: string): Promise<UserEntity | null>
  getByEmail(email: string): Promise<UserEntity | null>
}
