import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { DiaryItem } from '../models/DiaryItem'
import { DiaryUpdate } from '../models/DiaryUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

export class DiariesAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly diaryTable = process.env.DIARIES_TABLE) {
    }

    async getDiariesForUser(userId: String): Promise<DiaryItem[]> {
        const result = await this.docClient.query({
            TableName: this.diaryTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        const items = result.Items
        return items as DiaryItem[];
    }

    async createDiaryForUser(diaryItem: DiaryItem): Promise<DiaryItem> {
        await this.docClient.put({
            TableName: this.diaryTable,
            Item: diaryItem
        }).promise()

        return diaryItem as DiaryItem
    }

    async deleteDiaryForUser(diaryId: String, userId: String) {
        return await this.docClient.delete({
            TableName: this.diaryTable,
            Key: {
                userId: userId,
                diaryId: diaryId
            }
        }).promise();
    }

    async updateDiaryForUser(diaryUpdate: DiaryUpdate, userId: String, diaryId: String) {
        const params = {
            TableName: this.diaryTable,
            Key: {
                userId: userId,
                diaryId: diaryId
            },
            UpdateExpression: 'set #title = :title, #content = :content, #attachmentUrl = :attachmentUrl',
            ExpressionAttributeNames: { '#title': 'title', '#content': 'content', '#attachmentUrl': 'attachmentUrl'},
            ExpressionAttributeValues: {
                ':title': diaryUpdate.title,
                ':content': diaryUpdate.content,
                ':attachmentUrl': diaryUpdate.attachmentUrl,
            },
            ReturnValues: "UPDATED_NEW"
        }
        return await this.docClient.update(params).promise();
    }

    async updateDiariesImage(imageUrl: String, userId: String, diaryIds: String) {
        const params = {
            TableName: this.diaryTable,
            Key: {
                userId: userId,
                diaryId: diaryIds
            },
            UpdateExpression: 'set attachmentUrl = :r',
            ExpressionAttributeValues: {
                ':r': imageUrl,
            }
        }
        return await this.docClient.update(params).promise();
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}