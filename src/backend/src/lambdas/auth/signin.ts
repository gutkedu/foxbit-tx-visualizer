import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getLogger } from '@/shared/logger/get-logger.js'
import { CognitoProvider } from '@/providers/auth/cognito-provider.js'
import { z } from 'zod'
import { handleApiGwError } from '@/shared/errors/handle-api-gw-error.js'
import { apiResponse } from '@/shared/http/api-response.js'

const cognitoProvider = new CognitoProvider()
const logger = getLogger()

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export const signinHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Signin request received')

    const body = JSON.parse(event.body || '{}')
    const { email, password } = signinSchema.parse(body)

    const { idToken, accessToken, expiresIn, refreshToken } = await cognitoProvider.signIn(email, password)

    return apiResponse(200, { accessToken, idToken, expiresIn, refreshToken })
  } catch (error) {
    return handleApiGwError(error, 'Error during signin')
  }
}
