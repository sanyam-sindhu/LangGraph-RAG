import ReactMarkdown from 'react-markdown'
import { Bot, User, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { useState } from 'react'
import type { Message } from '../types'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [showSources, setShowSources] = useState(false)
  const isHuman = message.role === 'human'

  return (
    <div className={`flex gap-3 ${isHuman ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isHuman ? 'bg-brand-600' : 'bg-gray-700'
        }`}
      >
        {isHuman ? <User size={16} className="text-white" /> : <Bot size={16} className="text-brand-400" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isHuman ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isHuman
              ? 'bg-brand-600 text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-900 rounded-tl-sm'
          }`}
        >
          {isHuman ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources toggle */}
        {!isHuman && message.sources && message.sources.length > 0 && (
          <div className="w-full">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition mt-1"
            >
              <FileText size={12} />
              {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
              {showSources ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {showSources && (
              <div className="mt-2 space-y-2">
                {message.sources.map((src, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <FileText size={11} className="text-brand-500" />
                      <span className="text-xs font-medium text-brand-600 truncate">
                        {src.source}
                      </span>
                      {src.page > 0 && (
                        <span className="text-xs text-gray-400 ml-1">p.{src.page}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-3">{src.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
