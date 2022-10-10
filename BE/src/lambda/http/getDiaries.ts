import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getDiariesForUser as getDiariesForUser } from '../../businessLogic/diaries'
import { getUserId } from '../utils';

import { createLogger } from '../../utils/logger'

const logger  = createLogger("getDiaries");

// DIARY: Get all DIARY items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("## GET DIARIES ##")

    try {
      const userId = getUserId(event)

      logger.info("## GET USER ID ##")
      const diaries = await getDiariesForUser(userId);

      logger.info("## DIARIES By USER ID SUCCESSFULLY ##")

      return {
        statusCode: 200,
        body: JSON.stringify({
          "items": diaries
        })
      };
    } catch (error) {
      logger.error('## GET DIARY FAILED: ', { error: error.message })
      
      return {
        statusCode: 500,
        body: JSON.stringify({
          "message": "System errors"
        })
      }
    }
  })

handler
  .use(httpErrorHandler())
  .use(
  cors({
    credentials: true
  })
)
