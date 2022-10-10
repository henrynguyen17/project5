export interface DiaryItem {
  userId: string
  diaryId: string
  createdAt: string
  title: string
  content: string
  attachmentUrl?: string
}
