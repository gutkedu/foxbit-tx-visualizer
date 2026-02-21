import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getLogger } from '@/shared/logger/get-logger.js'
import { makeSignUpUser } from '@/use-cases/factories/make-sign-up-user.js'
import { z } from 'zod'
import { handleApiGwError } from '@/shared/errors/handle-api-gw-error.js'
import { apiResponse } from '@/shared/http/api-response.js'

const logger = getLogger()

const signUpUser = makeSignUpUser()

const signupSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8)
})

export const signupHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Signup request received')

    const body = JSON.parse(event.body || '{}')
    const { username, email, password } = signupSchema.parse(body)

    const { userId, username: createdUsername, userConfirmed } = await signUpUser.execute({ username, email, password })

    return apiResponse(201, { userId, username: createdUsername, userConfirmed })
  } catch (error) {
    return handleApiGwError(error, 'Error during signup')
  }
}
