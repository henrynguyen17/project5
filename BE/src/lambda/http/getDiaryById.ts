import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getDiaryByIdForUser as getDiaryByIdForUser } from '../../businessLogic/diaries'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'

const logger  = createLogger("getDiaryById");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("## GET DIARY ##")

    try {
      const userId = getUserId(event)
      const diaryId = event.pathParameters.diaryId

      logger.info("## GET ID ##")
      const diary = await getDiaryByIdForUser(userId, diaryId);

      logger.info("## DIARIES By ID SUCCESSFULLY ##")

      return {
        statusCode: 200,
        body: JSON.stringify({
          "item": diary
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
