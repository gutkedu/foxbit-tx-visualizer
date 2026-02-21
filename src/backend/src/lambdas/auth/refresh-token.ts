import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getLogger } from '@/shared/logger/get-logger.js'
import { CognitoProvider } from '@/providers/auth/cognito-provider.js'
import { z } from 'zod'
import { handleApiGwError } from '@/shared/errors/handle-api-gw-error.js'

const cognitoProvider = new CognitoProvider()
const logger = getLogger()

const refreshTokenSchema = z.object({
  refreshToken: z.string()
})

export const refreshTokenHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Refresh token request received')

    const body = JSON.parse(event.body || '{}')
    const { refreshToken: refreshInput } = refreshTokenSchema.parse(body)

    const { accessToken, expiresIn, idToken, refreshToken } = await cognitoProvider.refreshToken(refreshInput)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        accessToken,
        idToken,
        expiresIn,
        refreshToken
      })
    }
  } catch (error) {
    return handleApiGwError(error, 'Error refreshing token')
  }
}
