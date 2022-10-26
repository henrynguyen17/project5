import { apiEndpoint } from '../config'
import { Diary } from '../types/Diary';
import { CreateDiaryRequest } from '../types/CreateDiaryRequest';
import Axios from 'axios'
import { UpdateDiaryRequest } from '../types/UpdateDiaryRequest';

export async function getDiaries(idToken: string): Promise<Diary[]> {
  console.log('Fetching diaries')

  const response = await Axios.get(`${apiEndpoint}/diaries`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Diaries:', response.data)
  return response.data.items
}

export async function getDiaryById(idToken: string, diaryId: string): Promise<Diary> {
  const response = await Axios.get(`${apiEndpoint}/diaries/${diaryId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Diary: ', response.data)
  return response.data.item
}

export async function searchDiaries(idToken: string, searchText: string): Promise<Diary[]> {
  console.log('Fetching diaries')

  const response = await Axios.get(`${apiEndpoint}/diaries/search/${searchText}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Search Diaries:', response.data)
  return response.data.items
}

export async function createDiary(
  idToken: string,
  newDiary: CreateDiaryRequest
): Promise<Diary> {
  const response = await Axios.post(`${apiEndpoint}/diaries`,  JSON.stringify(newDiary), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchDiary(
  idToken: string,
  diaryId: string,
  updatedDiary: UpdateDiaryRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/diaries/${diaryId}`, JSON.stringify(updatedDiary), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteDiary(
  idToken: string,
  diaryId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/diaries/${diaryId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/diaries/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}

export async function removeAttachment(
  idToken: string,
  attachmentId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/diaries/attachment/${attachmentId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}
