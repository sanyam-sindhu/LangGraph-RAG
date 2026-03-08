import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Message, Thread } from '../types'
import { sendMessage, getChatHistory, clearChatHistory } from '../services/api'

const THREADS_KEY = 'rag_threads'

function loadThreads(): Thread[] {
  try {
    const raw = localStorage.getItem(THREADS_KEY)
    if (!raw) return []
    return JSON.parse(raw).map((t: Thread) => ({
      ...t,
      createdAt: new Date(t.createdAt),
    }))
  } catch {
    return []
  }
}

function saveThreads(threads: Thread[]) {
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads))
}

export function useChat() {
  const [threads, setThreads] = useState<Thread[]>(loadThreads)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectThread = useCallback(async (threadId: string) => {
    setActiveThreadId(threadId)
    setLoading(true)
    setError(null)
    try {
      const history = await getChatHistory(threadId)
      const msgs: Message[] = history.messages.map((m) => ({
        id: uuidv4(),
        role: m.role as 'human' | 'assistant',
        content: m.content,
        timestamp: new Date(),
      }))
      setMessages(msgs)
    } catch {
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createThread = useCallback(() => {
    const id = uuidv4()
    const newThread: Thread = {
      id,
      title: 'New conversation',
      createdAt: new Date(),
      messageCount: 0,
    }
    setThreads((prev) => {
      const updated = [newThread, ...prev]
      saveThreads(updated)
      return updated
    })
    setActiveThreadId(id)
    setMessages([])
    return id
  }, [])

  const send = useCallback(
    async (content: string) => {
      const threadId = activeThreadId ?? createThread()

      const userMsg: Message = {
        id: uuidv4(),
        role: 'human',
        content,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setLoading(true)
      setError(null)

      try {
        const response = await sendMessage(content, threadId)
        const assistantMsg: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMsg])

        // Update thread title and count
        setThreads((prev) => {
          const updated = prev.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  title: content.slice(0, 40) || t.title,
                  messageCount: t.messageCount + 2,
                }
              : t
          )
          saveThreads(updated)
          return updated
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message')
      } finally {
        setLoading(false)
      }
    },
    [activeThreadId, createThread]
  )

  const clearThread = useCallback(async (threadId: string) => {
    await clearChatHistory(threadId)
    setThreads((prev) => {
      const updated = prev.filter((t) => t.id !== threadId)
      saveThreads(updated)
      return updated
    })
    if (activeThreadId === threadId) {
      setActiveThreadId(null)
      setMessages([])
    }
  }, [activeThreadId])

  return {
    threads,
    activeThreadId,
    messages,
    loading,
    error,
    send,
    selectThread,
    createThread,
    clearThread,
  }
}
