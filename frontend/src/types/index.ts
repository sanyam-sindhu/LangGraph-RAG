export interface Message {
  id: string
  role: 'human' | 'assistant'
  content: string
  sources?: Source[]
  timestamp: Date
}

export interface Source {
  content: string
  source: string
  page: number
}

export interface Thread {
  id: string
  title: string
  createdAt: Date
  messageCount: number
}

export interface Document {
  source: string
  chunk_count: number
}

export interface ChatResponse {
  answer: string
  thread_id: string
  sources: Source[]
}

export interface UploadResponse {
  message: string
  document_count: number
  collection: string
}
