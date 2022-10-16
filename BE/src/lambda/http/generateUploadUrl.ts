import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createAttachmentPresignedUrl } from '../../businessLogic/diaries'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger("generateUploadUrl");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("## GENERATE UPLOAD URL ##");
    try {
      
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

      const url = await createAttachmentPresignedUrl();
      logger.info("## GENERATE UPLOAD URL SUCCESSFULLY ##");
      return {
        statusCode: 201,
        body: JSON.stringify({
          uploadUrl: url
        })
      }
    } catch (error) {
      logger.error('## GENERATE UPLOAD FAILED: ', { error: error.message })
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
