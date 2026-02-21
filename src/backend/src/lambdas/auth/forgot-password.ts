import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getLogger } from '@/shared/logger/get-logger.js'
import { CognitoProvider } from '@/providers/auth/cognito-provider.js'
import { z } from 'zod'
import { handleApiGwError } from '@/shared/errors/handle-api-gw-error.js'

const cognitoProvider = new CognitoProvider()
const logger = getLogger()

const forgotPasswordSchema = z.object({
  email: z.string().email()
})

export const forgotPasswordHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Forgot password request received')

    const body = JSON.parse(event.body || '{}')
    const { email } = forgotPasswordSchema.parse(body)

    await cognitoProvider.forgotPassword(email)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Password reset code sent successfully'
      })
    }
  } catch (error) {
    return handleApiGwError(error, 'Error during forgot password')
  }
}
