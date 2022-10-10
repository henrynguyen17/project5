import { DiaryItem } from '../models/DiaryItem';
import { CreateDiaryRequest } from '../requests/CreateDiaryRequest'
import { UpdateDiaryRequest } from '../requests/UpdateDiaryRequest'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk'
import { DiariesAccess } from '../dataLayer/diariesAccess';

const diariesAccess = new DiariesAccess();
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
const urlExpiration = process.env.SIGNED_URL_EXPIRATION


export const getDiariesForUser = async (userId: String): Promise<DiaryItem[]> => {
    return diariesAccess.getDiariesForUser(userId);
}

export async function createDiary(
    createDiaryRequest: CreateDiaryRequest,
    userId: string
): Promise<DiaryItem> {

    const diaryId = uuid.v4()

    return await diariesAccess.createDiaryForUser({
        userId: userId,
        diaryId: diaryId,
        createdAt: new Date().toISOString(),
        title: createDiaryRequest.title,
        content: createDiaryRequest.content,
        attachmentUrl: ""
    })
}

export async function deleteDiary(diaryId: string, userId: string) {
    return await diariesAccess.deleteDiaryForUser(diaryId, userId)
}

export async function updateDiary(updateDiaryRequest: UpdateDiaryRequest, diaryId: string, userId: string) {
    return await diariesAccess.updateDiaryForUser(updateDiaryRequest, userId, diaryId)
}

export async function createAttachmentPresignedUrl(diaryId: string, userId: string) {
    const imageId = uuid.v4();
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`;
    await diariesAccess.updateDiariesImage(imageUrl, userId, diaryId)
    const url = getUploadUrl(imageId)
    return url;
}

function getUploadUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: Number(urlExpiration)
    })
}