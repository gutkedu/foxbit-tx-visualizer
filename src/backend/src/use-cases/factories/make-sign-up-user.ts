import { CognitoProvider } from '@/providers/auth/cognito-provider.js'
import { DrizzleUserRepository } from '@/repositories/dsql/drizzle-user-repository.js'
import { SignUpUserUseCase } from '@/use-cases/sign-up-user.js'

export function makeSignUpUser(): SignUpUserUseCase {
  const userRepository = new DrizzleUserRepository()
  const authProvider = new CognitoProvider()
  return new SignUpUserUseCase(userRepository, authProvider)
}
