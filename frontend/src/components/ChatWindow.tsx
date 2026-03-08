import { useEffect, useRef } from 'react'
import { Bot } from 'lucide-react'
import type { Message } from '../types'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'

interface ChatWindowProps {
  messages: Message[]
  loading: boolean
  activeThreadId: string | null
  onSend: (message: string) => void
}

export function ChatWindow({ messages, loading, activeThreadId, onSend }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const showEmpty = !activeThreadId || messages.length === 0

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {showEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mb-4">
              <Bot size={32} className="text-brand-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Ask your documents</h2>
            <p className="text-gray-500 text-sm max-w-sm">
              Upload documents in the panel on the right, then ask questions and get answers grounded
              in your content.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {loading && (
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-brand-400" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-5">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} loading={loading} />
    </div>
  )
}
