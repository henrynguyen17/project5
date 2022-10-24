import { DiaryItem } from '../models/DiaryItem';
import { CreateDiaryRequest } from '../requests/CreateDiaryRequest'
import { UpdateDiaryRequest } from '../requests/UpdateDiaryRequest'
import * as uuid from 'uuid'
import { DiariesAccess } from '../dataLayer/diariesAccess';
import { AttachmentsAccess } from '../dataLayer/attachmentsAccess';
  
const diariesAccess = new DiariesAccess();
const attachmentsAccess = new AttachmentsAccess();

export const getDiariesForUser = async (userId: String): Promise<DiaryItem[]> => {
    return await diariesAccess.getDiariesForUser(userId);
}

export const getDiaryByIdForUser = async (userId: String, diaryId: String): Promise<DiaryItem> => {
    return await diariesAccess.getDiaryByIdForUser(userId, diaryId);
}

export const searchDiariesForUser = async (userId: String, searchText: string): Promise<DiaryItem[]> => {
    return await diariesAccess.searchDiariesForUser(userId, searchText);
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
        attachmentUrl: createDiaryRequest.attachmentUrl
    })
}

export async function deleteDiary(diaryId: string, userId: string) {
    const diary = await diariesAccess.getDiaryByIdForUser(userId, diaryId);
    const imageUrl = diary.attachmentUrl;
    const imageId = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);

    // clean old attachment
    if (imageId !== ''){
        attachmentsAccess.removeAttachment(imageId);
    }

    // remove item
    return await diariesAccess.deleteDiaryForUser(diaryId, userId)
}

export async function updateDiary(updateDiaryRequest: UpdateDiaryRequest, diaryId: string, userId: string) {
    const oldDiary = await diariesAccess.getDiaryByIdForUser(userId, diaryId);
    const oldImageUrl = oldDiary.attachmentUrl;
    const oldImageId = oldImageUrl.substring(oldImageUrl.lastIndexOf('/') + 1);

    if (oldImageId !== '' && oldImageId !== updateDiaryRequest.attachmentUrl){
        attachmentsAccess.removeAttachment(oldImageId);
    }

    return await diariesAccess.updateDiaryForUser(updateDiaryRequest, userId, diaryId)
}

export async function createAttachmentPresignedUrl(){
    return await attachmentsAccess.uploadImage();
}
