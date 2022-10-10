/**
 * Fields in a request to create a single DIARY item.
 */
export interface CreateDiaryRequest {
  title: string
  content: string
  attachmentUrl?: string
}
