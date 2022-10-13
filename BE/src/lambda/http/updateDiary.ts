import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateDiary } from '../../businessLogic/diaries'
import { UpdateDiaryRequest } from '../../requests/UpdateDiaryRequest'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'

const logger = createLogger("updateDiary")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("## UPDATE DIARY ##")
    try {
      const diaryId = event.pathParameters.diaryId
      const updatedDiary: UpdateDiaryRequest = JSON.parse(event.body)
      
      // Update a DIARY item with the provided id using values in the "updatedDiary" object
      const user = getUserId(event);
      await updateDiary(updatedDiary,diaryId,user);
      logger.info("## UPDATE DIARY SUCCESSFULLY ##");
      return {
        statusCode: 201,
        body: JSON.stringify({
          "item": "Diary had been update!"
        })
      }
    } catch (error) {
      logger.error("## UPDATE DIARY FAILED ##", { error: error.message })
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
