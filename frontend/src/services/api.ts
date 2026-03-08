import axios from 'axios'
import type { ChatResponse, UploadResponse, Document } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

export async function sendMessage(
  message: string,
  threadId: string
): Promise<ChatResponse> {
  const res = await api.post<ChatResponse>('/chat/', { message, thread_id: threadId })
  return res.data
}

export async function getChatHistory(
  threadId: string
): Promise<{ thread_id: string; messages: Array<{ role: string; content: string }> }> {
  const res = await api.get(`/chat/history/${threadId}`)
  return res.data
}

export async function clearChatHistory(threadId: string): Promise<void> {
  await api.delete(`/chat/history/${threadId}`)
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post<UploadResponse>('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function listDocuments(): Promise<Document[]> {
  const res = await api.get<{ documents: Document[] }>('/documents/list')
  return res.data.documents
}

export async function deleteDocument(sourceName: string): Promise<void> {
  await api.delete(`/documents/${encodeURIComponent(sourceName)}`)
}
