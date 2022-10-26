import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { removeAttachment } from '../../businessLogic/diaries'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger("removeAttachment");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("## REMOVE ATTACHMENT ##");
    try {
      const attachmentId = event.pathParameters.attachmentId

      // just verify if the user is existing in system
      var user = getUserId(event);
      if (user === null)
      {
        logger.error("## USER NOT FOUND ##")
        return {
        statusCode: 500,
        body: JSON.stringify({
          "message": "System errors: USER NOT FOUND"
        })}
      }

      const url = await removeAttachment(attachmentId);
      logger.info("## REMOVE ATTACHMENT SUCCESSFULLY ##");
      return {
        statusCode: 201,
        body: JSON.stringify({
          uploadUrl: url
        })
      }
    } catch (error) {
      logger.error('## REMOVE ATTACHMENT FAILED: ', { error: error.message })
      return {
        statusCode: 500,
        body: JSON.stringify({
          "message": "System errors"
        })
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
