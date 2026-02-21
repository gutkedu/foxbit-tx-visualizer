import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getLogger } from '@/shared/logger/get-logger.js'
import { CognitoProvider } from '@/providers/auth/cognito-provider.js'
import { z } from 'zod'
import { handleApiGwError } from '@/shared/errors/handle-api-gw-error.js'
import { DynamoUserRepository } from '@/repositories/dynamodb/dynamo-user-repository.js'
import { apiResponse } from '@/shared/http/api-response.js'

const cognitoProvider = new CognitoProvider()
const dynamoUserRepo = new DynamoUserRepository()
const logger = getLogger()

const confirmSignupSchema = z.object({
  email: z.string().email(),
  confirmationCode: z.string()
})

export const confirmSignupHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Confirm signup request received')

    const body = JSON.parse(event.body || '{}')
    const { email, confirmationCode } = confirmSignupSchema.parse(body)

    const user = await dynamoUserRepo.getByEmail(email)
    if (!user) {
      logger.error('User not found')
      return apiResponse(404, { message: 'User not found' })
    }

    await cognitoProvider.confirmSignUp(email, confirmationCode)

    user.userConfirmed = true

    await dynamoUserRepo.update(user)

    logger.info('User confirmed successfully')

    return apiResponse(200, { message: 'User confirmed successfully' })
  } catch (error) {
    return handleApiGwError(error, 'Error confirming user')
  }
}
