import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateDiaryRequest } from '../../requests/CreateDiaryRequest'
import { getUserId } from '../utils';
import { createDiary } from '../../businessLogic/diaries'

import { createLogger } from '../../utils/logger'

const logger = createLogger("createDiary");
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("## CREATE DIARY ##")
    
    try {
      const newDiary: CreateDiaryRequest = JSON.parse(event.body)
      const user = getUserId(event);
      const diary = await createDiary(newDiary,user)
      
      logger.info("## CREATE DIARY SUCCESSFULLY ##")
      return {
        statusCode: 201,
        body: JSON.stringify({
          "item": diary
        })
      }
    } catch (error) {
      logger.error("## CREATE DIARY FAILED ##", { error: error.message })
      return {
        statusCode: 500,
        body: JSON.stringify({
          "message": "System errors"
        })
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
