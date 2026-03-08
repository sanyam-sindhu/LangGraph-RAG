import { PlusCircle, MessageSquare, Trash2, Bot } from 'lucide-react'
import type { Thread } from '../types'

interface SidebarProps {
  threads: Thread[]
  activeThreadId: string | null
  onSelectThread: (id: string) => void
  onCreateThread: () => void
  onDeleteThread: (id: string) => void
}

export function Sidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onCreateThread,
  onDeleteThread,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64 shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-700">
        <Bot size={22} className="text-brand-500" />
        <span className="font-semibold text-sm tracking-wide">LangGraph RAG</span>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onCreateThread}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 transition text-sm font-medium"
        >
          <PlusCircle size={16} />
          New Conversation
        </button>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {threads.length === 0 && (
          <p className="text-gray-500 text-xs text-center mt-4 px-2">
            No conversations yet. Start a new one above.
          </p>
        )}
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${
              activeThreadId === thread.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
            onClick={() => onSelectThread(thread.id)}
          >
            <MessageSquare size={14} className="shrink-0" />
            <span className="flex-1 text-xs truncate">{thread.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteThread(thread.id)
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
