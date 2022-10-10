import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteDiary } from '../../businessLogic/diaries'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'

const logger = createLogger("deleteDiary");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("## DELETE DIARY ##");
    try {
      const diaryId = event.pathParameters.diaryId
      
      // DIARY: Remove a DIARY item by id
      const user = getUserId(event);
      await deleteDiary(diaryId,user);
      
      return {
        statusCode: 201,
        body: JSON.stringify({
          "message": "Diary had been deleted!"
        })
      }
    } catch (error) {
      logger.error('## DELETE DIARY FAILED: ', { error: error.message });
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
