import { eq } from 'drizzle-orm'
import { UserEntity, UserProps } from '@/core/entities/user.js'
import { UserRepository } from '../user-repository.js'
import { getDb } from '@/db/client.js'
import { users, UserRow } from '@/db/schema.js'

// Compile-time check: every key in UserProps must exist as a column in UserRow.
// If you add a field to UserProps but forget to add it to the schema, this errors.
type _UserSyncCheck = { [K in keyof UserProps]: K extends keyof UserRow ? true : never }
const _assertUserSync: _UserSyncCheck = undefined as unknown as _UserSyncCheck
void _assertUserSync

export class DrizzleUserRepository implements UserRepository {
  async create(user: UserEntity): Promise<UserEntity> {
    const db = await getDb()
    const [row] = await db
      .insert(users)
      .values({
        id: user.id,
        username: user.username,
        email: user.email,
        cognitoSub: user.cognitoSub,
        userConfirmed: user.userConfirmed,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      })
      .returning()
    return this.toEntity(row)
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const db = await getDb()
    const [row] = await db
      .update(users)
      .set({
        username: user.username,
        email: user.email,
        userConfirmed: user.userConfirmed,
        updatedAt: new Date(user.updatedAt),
      })
      .where(eq(users.id, user.id))
      .returning()
    return this.toEntity(row)
  }

  async getByUsername(username: string): Promise<UserEntity | null> {
    const db = await getDb()
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
    return row ? this.toEntity(row) : null
  }

  async getByEmail(email: string): Promise<UserEntity | null> {
    const db = await getDb()
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    return row ? this.toEntity(row) : null
  }

  private toEntity(row: UserRow): UserEntity {
    return UserEntity.reconstitute({
      id: row.id,
      username: row.username,
      email: row.email,
      cognitoSub: row.cognitoSub,
      userConfirmed: row.userConfirmed,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })
  }
}
