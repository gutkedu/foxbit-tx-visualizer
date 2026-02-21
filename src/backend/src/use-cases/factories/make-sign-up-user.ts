import { CognitoProvider } from '@/providers/auth/cognito-provider.js'
import { DynamoUserRepository } from '@/repositories/dynamodb/dynamo-user-repository.js'
import { SignUpUserUseCase } from '@/use-cases/sign-up-user.js'

export function makeSignUpUser(): SignUpUserUseCase {
  const userRepository = new DynamoUserRepository()
  const authProvider = new CognitoProvider()
  return new SignUpUserUseCase(userRepository, authProvider)
}
