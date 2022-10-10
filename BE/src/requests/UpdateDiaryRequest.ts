/**
 * Fields in a request to update a single DIARY item.
 */
export interface UpdateDiaryRequest {
  userId: string
  diaryId: string
  title: string
  content: string
  attachmentUrl?: string
}