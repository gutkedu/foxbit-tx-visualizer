import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getLogger } from '@/shared/logger/get-logger.js'
import { CognitoProvider } from '@/providers/auth/cognito-provider.js'
import { z } from 'zod'
import { handleApiGwError } from '@/shared/errors/handle-api-gw-error.js'
import { apiResponse } from '@/shared/http/api-response.js'

const cognitoProvider = new CognitoProvider()
const logger = getLogger()

const resetPasswordSchema = z.object({
  email: z.string().email(),
  confirmationCode: z.string(),
  newPassword: z.string().min(8)
})

export const resetPasswordHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Reset password request received')

    const body = JSON.parse(event.body || '{}')
    const { email, confirmationCode, newPassword } = resetPasswordSchema.parse(body)

    await cognitoProvider.confirmForgotPassword(email, confirmationCode, newPassword)

    return apiResponse(200, { message: 'Password reset successful' })
  } catch (error) {
    return handleApiGwError(error, 'Error resetting password')
  }
}
