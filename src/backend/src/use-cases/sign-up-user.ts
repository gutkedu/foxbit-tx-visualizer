import { UserEntity } from '@/core/entities/user.js'
import { AuthProvider } from '@/providers/auth/auth-provider.js'
import { UserRepository } from '@/repositories/user-repository.js'

interface SignUpUserRequest {
  username: string
  email: string
  password: string
}

interface SignUpUserResponse {
  userId: string
  username: string
  userConfirmed: boolean
}

export class SignUpUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private authProvider: AuthProvider
  ) {}

  async execute({ username, email, password }: SignUpUserRequest): Promise<SignUpUserResponse> {
    const existingUser = await this.userRepository.getByUsername(username)
    if (existingUser) {
      throw new Error('User already exists for this username')
    }

    const { userConfirmed, userSub } = await this.authProvider.signUp(email, password, {
      preferred_username: username
    })

    const user = UserEntity.create({
      email,
      username,
      cognitoSub: userSub,
      userConfirmed
    })

    await this.userRepository.create(user)

    return {
      userId: user.id,
      username: user.username,
      userConfirmed: user.userConfirmed
    }
  }
}
