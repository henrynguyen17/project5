import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { searchDiariesForUser as searchDiariesForUser } from '../../businessLogic/diaries'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'

const logger  = createLogger("searchDiaries");

// search DIARY items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("## SEARCH DIARIES ##")

    try {
      const userId = getUserId(event)
      const searchText = event.pathParameters.searchText
      logger.info("My search text: " + searchText)

      const diaries = await searchDiariesForUser(userId, searchText);

      logger.info("## DIARIES By USER ID AND SEARCH SUCCESSFULLY ##")

      return {
        statusCode: 200,
        body: JSON.stringify({
          "items": diaries
        })
      };
    } catch (error) {
      logger.error('## SEARCH DIARY FAILED: ', { error: error.message })
      
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
